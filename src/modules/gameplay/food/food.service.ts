import { Injectable, Logger } from "@nestjs/common"
import { Client } from "colyseus"
import { GameRoomColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { GameActionResponseMessage } from "../events"
import { PurchaseFoodPayload, GetCatalogPayload, GetFoodInventoryPayload, FeedPetWithFoodPayload } from "./food.events"
import { ActionResponsePayload } from "../events"

interface FoodItems {
    [key: string]: {
        price: number
        nutrition: number
        name: string
    }
}

@Injectable()
export class FoodGameService {
    private readonly logger = new Logger(FoodGameService.name)

    // Get food items configuration
    private getFoodItems(): FoodItems {
        return {
            hamburger: { price: 10, nutrition: 20, name: "Hamburger" },
            apple: { price: 5, nutrition: 10, name: "Apple" },
            fish: { price: 15, nutrition: 25, name: "Fish" },
        }
    }

    // Get nutrition value for a food type
    private getFoodNutrition(foodType: string): number {
        const foodItems = this.getFoodItems()
        return foodItems[foodType]?.nutrition || 10
    }

    // Get food price
    private getFoodPrice(foodType: string): number {
        const foodItems = this.getFoodItems()
        return foodItems[foodType]?.price || 5
    }

    // Validate if food type exists
    private isValidFoodType(foodType: string): boolean {
        const foodItems = this.getFoodItems()
        return foodType in foodItems
    }

    async handlePurchaseItem({ room, client, sessionId, itemType, itemName, quantity }: PurchaseFoodPayload) {
        try {
            this.logger.debug(`🛒 [FoodGameService] Handling purchase item request: ${itemType} x${quantity}`)

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                this.sendActionResponse(client, GameActionResponseMessage.Purchase, {
                    success: false,
                    message: GameActionResponseMessage.Purchase,
                })
                return
            }

            // Validate food type
            if (!this.isValidFoodType(itemType)) {
                this.sendActionResponse(client, GameActionResponseMessage.Purchase, {
                    success: false,
                    message: GameActionResponseMessage.Purchase,
                })
                return
            }

            // Get food item details
            const foodItem = this.getFoodItems()[itemType]
            const totalCost = foodItem.price * quantity

            // TODO: Implement actual purchase logic (check player coins, add to inventory, etc.)
            // For now, just return success
            this.logger.debug(
                `✅ [FoodGameService] Purchase successful: ${itemType} x${quantity} for ${totalCost} tokens`,
            )

            this.sendActionResponse(client, GameActionResponseMessage.Purchase, {
                success: true,
                message: GameActionResponseMessage.Purchase,
                data: {
                    itemType,
                    itemName: itemName || foodItem.name,
                    quantity,
                    totalCost,
                    newTokenBalance: player.tokens,
                },
            })
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error purchasing item: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            this.sendActionResponse(client, GameActionResponseMessage.Purchase, {
                success: false,
                message: GameActionResponseMessage.Purchase,
            })
        }
    }

    async handleGetCatalog({ client }: GetCatalogPayload) {
        try {
            this.logger.debug(`🏪 [FoodGameService] Handling get catalog request`)

            const catalog = this.getFoodItems()

            client.send("store_catalog", {
                success: true,
                data: { catalog },
                message: "Store catalog retrieved successfully",
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error getting catalog: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            client.send("store_catalog", {
                success: false,
                error: "Failed to get store catalog",
                timestamp: Date.now(),
            })
        }
    }

    async handleGetInventory({ room, client, sessionId }: GetFoodInventoryPayload) {
        try {
            this.logger.debug(`📦 [FoodGameService] Handling get inventory request`)

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                client.send(`inventory_response`, {
                    success: false,
                    error: "Player not found",
                    timestamp: Date.now(),
                })
                return
            }

            // Get inventory summary
            const inventorySummary = this.getInventorySummary(player)

            client.send("inventory_response", {
                success: true,
                data: { inventory: inventorySummary },
                message: "Inventory retrieved successfully",
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error getting inventory: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            client.send("inventory_response", {
                success: false,
                error: "Failed to get inventory",
                timestamp: Date.now(),
            })
        }
    }

    async handleFeedPet({ room, client, sessionId, petId, foodType, quantity }: FeedPetWithFoodPayload) {
        try {
            this.logger.debug(
                `🍽️ [FoodGameService] Handling feed pet request: petId=${petId}, foodType=${foodType}, quantity=${quantity}`,
            )

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                client.send("feed_result", {
                    success: false,
                    error: "Player not found",
                    timestamp: Date.now(),
                })
                return
            }

            // Validate food type
            if (!this.isValidFoodType(foodType)) {
                client.send("feed_result", {
                    success: false,
                    error: "Invalid food type",
                    timestamp: Date.now(),
                })
                return
            }

            // Get nutrition value
            const nutrition = this.getFoodNutrition(foodType)

            // TODO: Implement actual feeding logic (update pet hunger, consume food from inventory, etc.)

            client.send("feed_result", {
                success: true,
                data: {
                    petId,
                    foodType,
                    nutrition,
                },
                message: "Pet fed successfully",
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error feeding pet: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            client.send("feed_result", {
                success: false,
                error: error instanceof Error ? error.message : "Failed to feed pet",
                timestamp: Date.now(),
            })
        }
    }

    private getPlayer(state: GameRoomColyseusSchema, sessionId: string): PlayerColyseusSchema | undefined {
        return state.players.get(sessionId)
    }

    private getInventorySummary(player: PlayerColyseusSchema) {
        const summary = {
            totalItems: 0,
            itemsByType: {} as Record<string, number>,
            items: [] as Array<{
                type: string
                id: string
                name: string
                quantity: number
                totalPurchased: number
            }>,
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

    private sendActionResponse(
        client: Client,
        messageType: string,
        payload: ActionResponsePayload<Record<string, unknown>>,
    ) {
        client.send(messageType, {
            success: payload.success,
            message: payload.message,
            data: payload.data ?? {},
            timestamp: Date.now(),
        })
    }
}
