import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { GameInventoryEvent } from "@modules/colyseus/events"
import {
    PurchaseInventoryItemPayload,
    GetInventoryPayload,
    PurchaseInventoryItemResponsePayload,
    GetInventoryResponsePayload,
    PurchaseInventoryItemResult,
    GetInventoryResult,
    InventorySummary,
} from "./types"
import { GameRoomColyseusSchema, PlayerColyseusSchema, InventoryItemColyseusSchema } from "@modules/colyseus/schemas"
import { PlayerSyncService } from "../player/player-sync.service"
import { MemdbStorageService, StoreItemSchema } from "@modules/databases"
import { TrackGameAction } from "@modules/prometheus/decorators"

/**
 * Inventory Event Handler - Business logic layer
 * Handles all inventory-related game logic directly without calling gameplay services
 */
@Injectable()
export class InventoryEventHandler {
    private readonly logger = new Logger(InventoryEventHandler.name)
    constructor(
        @Inject(forwardRef(() => PlayerSyncService)) private readonly playerSyncService: PlayerSyncService,
        private readonly memdbStorageService: MemdbStorageService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @OnEvent(GameInventoryEvent.PurchaseItemRequested)
    @TrackGameAction("item_purchased", { labels: ["itemType", "itemId"], trackDuration: true })
    async onPurchaseItem(payload: PurchaseInventoryItemPayload) {
        this.logger.debug(`Event received: ${GameInventoryEvent.PurchaseItemRequested}`)
        let result: PurchaseInventoryItemResult

        try {
            if (!payload.itemId) {
                result = {
                    success: false,
                    message: "Item ID is required",
                    error: "Item ID is required",
                }
            } else {
                const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
                if (!player) {
                    result = {
                        success: false,
                        message: "Player not found in room",
                        error: "Player not found in room",
                    }
                } else {
                    // Get store item from memdb (memory cache) instead of querying DB
                    const storeItem = this.getStoreItemFromMemdb(payload.itemId)

                    if (!storeItem) {
                        result = {
                            success: false,
                            message: `Store item ${payload.itemId} not found`,
                            error: `Store item ${payload.itemId} not found`,
                        }
                    } else {
                        const price = storeItem.costNom * payload.quantity

                        // Check if player has enough tokens
                        if (player.tokens < price) {
                            result = {
                                success: false,
                                message: `Not enough tokens. Need ${price}, have ${player.tokens}`,
                                error: `Not enough tokens. Need ${price}, have ${player.tokens}`,
                            }
                        } else {
                            // Deduct tokens from player in state
                            player.tokens -= price

                            // Sync tokens to DB immediately
                            await this.playerSyncService.syncTokensToDB(player).catch((error) => {
                                this.logger.error(`Failed to sync tokens to DB: ${error.message}`)
                            })

                            // Add item to player inventory (only in state, will be synced to DB later by background job)
                            this.addItem(player, payload.itemType, payload.itemId, storeItem.name, payload.quantity)

                            result = {
                                success: true,
                                message: `Purchased ${payload.quantity}x ${payload.itemId}`,
                                data: {
                                    itemId: payload.itemId,
                                    itemType: payload.itemType,
                                    quantity: payload.quantity,
                                    newTokenBalance: player.tokens,
                                },
                                player,
                            }
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Failed to handle purchase item: ${error.message}`, error.stack)
            result = {
                success: false,
                message: "Failed to purchase item",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }

        // Emit response event - room will handle sending the response
        this.eventEmitter.emit(GameInventoryEvent.PurchaseItemResponse, {
            client: payload.client,
            sessionId: payload.sessionId,
            result,
        } as PurchaseInventoryItemResponsePayload)
    }

    @OnEvent(GameInventoryEvent.GetInventoryRequested)
    async onGetInventory(payload: GetInventoryPayload) {
        this.logger.debug(`Event received: ${GameInventoryEvent.GetInventoryRequested}`)
        let result: GetInventoryResult

        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                result = {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            } else {
                const inventorySummary = this.getInventorySummary(player)

                result = {
                    success: true,
                    message: "Inventory retrieved successfully",
                    data: { inventory: inventorySummary as unknown as Record<string, unknown> },
                    tokens: player.tokens,
                    player,
                }
            }
        } catch (error) {
            this.logger.debug(`Failed to handle get inventory: ${error.message}`, error.stack)
            result = {
                success: false,
                message: "Failed to get inventory",
                error: "Failed to get inventory",
            }
        }

        // Emit response event - room will handle sending the response
        this.eventEmitter.emit(GameInventoryEvent.GetInventoryResponse, {
            client: payload.client,
            sessionId: payload.sessionId,
            result,
        } as GetInventoryResponsePayload)
    }

    // Helper methods
    private getPlayer(state: GameRoomColyseusSchema, sessionId: string): PlayerColyseusSchema | undefined {
        return state.players.get(sessionId)
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
            this.logger.debug(
                `Error getting store item from memdb: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        }
    }

    // Add item to player inventory
    private addItem(
        player: PlayerColyseusSchema,
        itemType: string,
        itemId: string,
        itemName: string,
        quantity: number,
    ): void {
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
            `Added ${quantity}x ${itemId} to ${player.sessionId}'s inventory. Total: ${inventoryItem.quantity}`,
        )
    }

    // Get inventory summary
    private getInventorySummary(player: PlayerColyseusSchema): InventorySummary {
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
}
