import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import { InjectConnection } from "@nestjs/mongoose"
import { Connection, Model, ClientSession } from "mongoose"
import { GameRoomColyseusSchema, PlayerColyseusSchema, InventoryItemColyseusSchema } from "@modules/colyseus/schemas"
import { PurchaseInventoryItemPayload, GetInventoryPayload } from "./inventory.events"
import { PlayerGameService } from "../player/player.service"
import { StoreItemSchema } from "@modules/databases/mongodb/game/schemas/store-item.schema"
import { PurchaseInventoryItemResult, GetInventoryResult } from "./inventory.results"
import { GAME_MONGOOSE_CONNECTION_NAME } from "@modules/databases/mongodb/game/constants"
import { MemdbStorageService } from "@modules/databases"

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
        @InjectConnection(GAME_MONGOOSE_CONNECTION_NAME) private connection: Connection,
        private readonly memdbStorageService: MemdbStorageService,
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

    async handlePurchaseItem({
        room,
        sessionId,
        itemId,
        itemType,
        quantity,
    }: PurchaseInventoryItemPayload): Promise<PurchaseInventoryItemResult> {
        try {
            this.logger.debug(`🛒 [InventoryGameService] Handling purchase item request: ${itemId} x${quantity}`)

            if (!itemId) {
                return {
                    success: false,
                    message: "Item ID is required",
                    error: "Item ID is required",
                }
            }

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            // Get store item from memdb (memory cache) instead of querying DB
            const storeItem = this.getStoreItemFromMemdb(itemId)

            if (!storeItem) {
                return {
                    success: false,
                    message: `Store item ${itemId} not found`,
                    error: `Store item ${itemId} not found`,
                    player,
                }
            }

            const price = storeItem.costNom * quantity

            // Check if player has enough tokens
            if (player.tokens < price) {
                return {
                    success: false,
                    message: `Not enough tokens. Need ${price}, have ${player.tokens}`,
                    error: `Not enough tokens. Need ${price}, have ${player.tokens}`,
                    player,
                }
            }

            // Deduct tokens from player in state
            player.tokens -= price

            // Sync tokens to DB immediately (tokens must be synced immediately for data integrity)
            await this.playerService.syncTokensToDB(player).catch((error) => {
                this.logger.error(`Failed to sync tokens to DB: ${error.message}`)
                // Continue even if sync fails - state is already updated
            })

            const transactionResult = {
                success: true,
                message: `Purchased ${quantity}x ${itemId}`,
                newTokenBalance: player.tokens,
            }

            // Add item to player inventory (only in state, will be synced to DB later by background job)
            this.addItem(player, itemType, itemId, storeItem.name, quantity)

            return {
                success: true,
                message: transactionResult.message,
                data: {
                    itemId,
                    itemType,
                    quantity,
                    newTokenBalance: transactionResult.newTokenBalance,
                },
                player,
            }
        } catch (error) {
            this.logger.error(
                `❌ [InventoryGameService] Error purchasing item: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return {
                success: false,
                message: error instanceof Error ? error.message : "Purchase failed",
                error: error instanceof Error ? error.message : "Purchase failed",
            }
        }
    }

    async handleGetInventory({ room, sessionId }: GetInventoryPayload): Promise<GetInventoryResult> {
        try {
            this.logger.debug("📦 [InventoryGameService] Handling get inventory request")

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            const inventorySummary = this.getInventorySummary(player)

            return {
                success: true,
                message: "Inventory retrieved successfully",
                data: { inventory: inventorySummary as unknown as Record<string, unknown> },
                tokens: player.tokens,
                player,
            }
        } catch (error) {
            this.logger.error(
                `❌ [InventoryGameService] Error getting inventory: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return {
                success: false,
                message: "Failed to get inventory",
                error: "Failed to get inventory",
            }
        }
    }

    /**
     * Get store item from memdb (memory cache) instead of querying DB
     * This is much faster and reduces DB load
     */
    private getStoreItemFromMemdb(itemId: string): StoreItemSchema | null {
        try {
            const storeItems = this.memdbStorageService.getStoreItems()
            const storeItem = storeItems.find((item) => item._id?.toString() === itemId || item._id === itemId)
            return storeItem || null
        } catch (error) {
            this.logger.error(
                `Error getting store item from memdb: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        }
    }

    /**
     * @deprecated Use getStoreItemFromMemdb instead. This method queries DB directly.
     * Only use this if memdb doesn't have the item (shouldn't happen in normal flow)
     */
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
}
