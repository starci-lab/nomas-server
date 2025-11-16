import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import { InjectConnection } from "@nestjs/mongoose"
import { Connection, Model, ClientSession } from "mongoose"
import { Client } from "colyseus"
import { GameRoomColyseusSchema, PlayerColyseusSchema, InventoryItemColyseusSchema } from "@modules/colyseus/schemas"
import { PurchaseInventoryItemPayload, GetInventoryPayload } from "./inventory.events"
import { PlayerGameService } from "../player/player.service"
import { StoreItemSchema } from "@modules/databases/mongodb/game/schemas/store-item.schema"

type ActionResponsePayload = {
    success: boolean
    message: string
    data?: Record<string, unknown>
}

interface InventorySummary {
    totalItems: number
    itemsByType: Record<string, number>
    items: Array<{
        type: string
        id: string
        name: string
        quantity: number
        totalPurchased: number
    }>
}

@Injectable()
export class InventoryGameService {
    private readonly logger = new Logger(InventoryGameService.name)

    constructor(
        @Inject(forwardRef(() => PlayerGameService)) private playerService: PlayerGameService,
        @InjectConnection() private connection: Connection,
    ) {}

    // Lazy load model - chỉ tạo khi cần dùng
    private get storeItemModel(): Model<StoreItemSchema> {
        return this.connection.model<StoreItemSchema>(StoreItemSchema.name)
    }

    // Helper method to execute operations with transaction
    private async withTransaction<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
        const session = await this.connection.startSession()
        try {
            let result: T | undefined
            await session.withTransaction(async () => {
                result = await operation(session)
            })
            if (!result) {
                throw new Error("Transaction operation returned undefined result")
            }
            return result
        } finally {
            await session.endSession()
        }
    }

    async handlePurchaseItem({ room, client, sessionId, itemId, itemType, quantity }: PurchaseInventoryItemPayload) {
        try {
            this.logger.debug(`🛒 [InventoryGameService] Handling purchase item request: ${itemId} x${quantity}`)

            if (!itemId) {
                this.sendActionResponse(client, "purchase_response", {
                    success: false,
                    message: "Item ID is required",
                })
                return
            }

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                this.sendActionResponse(client, "purchase_response", {
                    success: false,
                    message: "Player not found in room",
                })
                return
            }

            // Use transaction for purchase operation
            const result = await this.withTransaction(async (session) => {
                const storeItem = await this.getStoreItem(itemId)

                if (!storeItem) {
                    throw new Error(`Store item ${itemId} not found`)
                }

                const price = storeItem.costNom * quantity

                // Check if player has enough tokens
                const hasEnoughTokens = await this.playerService.hasEnoughTokens(player, price)
                if (!hasEnoughTokens) {
                    throw new Error("Not enough tokens")
                }

                // Deduct tokens from player (with session)
                const tokenDeducted = await this.playerService.deductTokensWithSession(player, price, session)
                if (!tokenDeducted) {
                    throw new Error("Failed to deduct tokens")
                }

                // Add item to player inventory
                this.addItem(player, itemType, itemId, storeItem.name, quantity)

                return {
                    success: true,
                    message: `Purchased ${quantity}x ${itemId}`,
                    newTokenBalance: player.tokens,
                }
            })

            // Send response to client
            this.sendActionResponse(client, "purchase_response", {
                success: true,
                message: result.message,
                data: {
                    itemId,
                    itemType,
                    quantity,
                    newTokenBalance: result.newTokenBalance,
                },
            })
        } catch (error) {
            this.logger.error(
                `❌ [InventoryGameService] Error purchasing item: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            this.sendActionResponse(client, "purchase_response", {
                success: false,
                message: error instanceof Error ? error.message : "Purchase failed",
            })
        }
    }

    async handleGetInventory({ room, client, sessionId }: GetInventoryPayload) {
        try {
            this.logger.debug(`📦 [InventoryGameService] Handling get inventory request`)

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                this.sendActionResponse(client, "inventory_response", {
                    success: false,
                    message: "Player not found in room",
                })
                return
            }

            const inventorySummary = this.getInventorySummary(player)

            client.send("inventory_response", {
                success: true,
                data: { inventory: inventorySummary },
                message: "Inventory retrieved successfully",
                tokens: player.tokens,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(
                `❌ [InventoryGameService] Error getting inventory: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            client.send("inventory_response", {
                success: false,
                error: "Failed to get inventory",
                timestamp: Date.now(),
            })
        }
    }

    async getStoreItem(itemId: string): Promise<StoreItemSchema | null> {
        try {
            const storeItem = await this.storeItemModel.findOne({ _id: itemId }).exec()
            return storeItem
        } catch (error) {
            this.logger.error(`Error getting store item: ${error instanceof Error ? error.message : "Unknown error"}`)
            throw error
        }
    }

    // Add item to player inventory
    addItem(player: PlayerColyseusSchema, itemType: string, itemId: string, itemName: string, quantity: number): void {
        const itemKey = `${itemType}_${itemId}`

        let inventoryItem = player.inventory.get(itemKey)
        if (!inventoryItem) {
            inventoryItem = new InventoryItemColyseusSchema()
            inventoryItem.itemType = itemType
            inventoryItem.itemId = itemId
            inventoryItem.quantity = 0
            inventoryItem.itemName = itemName
            inventoryItem.totalPurchased = 0
            player.inventory.set(itemKey, inventoryItem)
        }

        inventoryItem.quantity += quantity
        inventoryItem.totalPurchased += quantity

        this.logger.debug(
            `📦 Added ${quantity}x ${itemId} to ${player.sessionId}'s inventory. Total: ${inventoryItem.quantity}`,
        )
    }

    // Use item from inventory (decrease quantity)
    useItem(player: PlayerColyseusSchema, itemType: string, itemName: string, quantity: number = 1): boolean {
        const itemKey = `${itemType}_${itemName}`
        const inventoryItem = player.inventory.get(itemKey)

        if (!inventoryItem || inventoryItem.quantity < quantity) {
            this.logger.warn(
                `❌ ${player.sessionId} doesn't have enough ${itemName}. Has: ${inventoryItem?.quantity || 0}, needs: ${quantity}`,
            )
            return false
        }

        inventoryItem.quantity -= quantity
        this.logger.debug(`✅ ${player.sessionId} used ${quantity}x ${itemName}. Remaining: ${inventoryItem.quantity}`)

        // Remove item from inventory if quantity reaches 0
        if (inventoryItem.quantity <= 0) {
            player.inventory.delete(itemKey)
            this.logger.debug(`🗑️ Removed ${itemName} from inventory (quantity reached 0)`)
        }

        return true
    }

    // Get item quantity
    getItemQuantity(player: PlayerColyseusSchema, itemType: string, itemName: string): number {
        const itemKey = `${itemType}_${itemName}`
        const inventoryItem = player.inventory.get(itemKey)
        return inventoryItem ? inventoryItem.quantity : 0
    }

    // Get total quantity of all items of a specific type
    getTotalItemsByType(player: PlayerColyseusSchema, itemType: string): number {
        let total = 0
        player.inventory.forEach((item) => {
            if (item.itemType === itemType) {
                total += item.quantity
            }
        })
        return total
    }

    // Get inventory summary
    getInventorySummary(player: PlayerColyseusSchema): InventorySummary {
        const summary: InventorySummary = {
            totalItems: 0,
            itemsByType: {},
            items: [],
        }

        player.inventory.forEach((item) => {
            summary.totalItems += item.quantity

            if (!summary.itemsByType[item.itemType]) {
                summary.itemsByType[item.itemType] = 0
            }
            summary.itemsByType[item.itemType] += item.quantity

            summary.items.push({
                type: item.itemType,
                id: item.itemId,
                name: item.itemName,
                quantity: item.quantity,
                totalPurchased: item.totalPurchased,
            })
        })

        return summary
    }

    private getPlayer(state: GameRoomColyseusSchema, sessionId: string): PlayerColyseusSchema | undefined {
        return state.players.get(sessionId)
    }

    private sendActionResponse(client: Client, messageType: string, payload: ActionResponsePayload) {
        client.send(messageType, {
            success: payload.success,
            message: payload.message,
            data: payload.data ?? {},
            timestamp: Date.now(),
        })
    }
}
