import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { GameFoodEvent } from "@modules/colyseus/events"
import {
    PurchaseFoodPayload,
    GetCatalogPayload,
    GetFoodInventoryPayload,
    FeedPetWithFoodPayload,
    PurchaseFoodResponsePayload,
    GetCatalogResponsePayload,
    GetFoodInventoryResponsePayload,
    FeedPetWithFoodResponsePayload,
    PurchaseFoodResult,
    GetCatalogResult,
    GetFoodInventoryResult,
    FeedPetWithFoodResult,
    StateRoom,
    FoodItems,
    InventorySummary,
} from "./types"
import {
    GameRoomColyseusSchema,
    PlayerColyseusSchema,
    PetColyseusSchema,
    InventoryItemColyseusSchema,
} from "@modules/colyseus/schemas"
import { PlayerSyncService } from "../player-sync.service"

/**
 * Food Event Handler - Business logic layer
 * Handles all food-related game logic directly without calling gameplay services
 */
@Injectable()
export class FoodEventHandler {
    private readonly logger = new Logger(FoodEventHandler.name)
    constructor(
        @Inject(forwardRef(() => PlayerSyncService)) private readonly playerSyncService: PlayerSyncService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

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

    // Validate if food type exists
    private isValidFoodType(foodType: string): boolean {
        const foodItems = this.getFoodItems()
        return foodType in foodItems
    }

    @OnEvent(GameFoodEvent.PurchaseRequested)
    async onPurchaseFood(payload: PurchaseFoodPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.PurchaseRequested}`)
        let result: PurchaseFoodResult

        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                result = {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            } else {
                // Validate food type
                if (!this.isValidFoodType(payload.itemType)) {
                    result = {
                        success: false,
                        message: "Invalid food type",
                        error: "Invalid food type",
                        player,
                    }
                } else {
                    // Get food item details
                    const foodItem = this.getFoodItems()[payload.itemType]
                    const totalCost = foodItem.price * payload.quantity

                    // Check if player has enough tokens
                    if (player.tokens < totalCost) {
                        result = {
                            success: false,
                            message: `Not enough tokens. Need ${totalCost}, have ${player.tokens}`,
                            error: `Not enough tokens. Need ${totalCost}, have ${player.tokens}`,
                            player,
                        }
                    } else {
                        // Deduct tokens from player in state
                        player.tokens -= totalCost

                        // Sync tokens to DB immediately
                        await this.playerSyncService.syncTokensToDB(player).catch((error) => {
                            this.logger.error(`Failed to sync tokens to DB: ${error.message}`)
                        })

                        // Add item to inventory
                        const itemId = payload.itemType // Use itemType as itemId for food items
                        this.addItem(player, "food", itemId, payload.itemName || foodItem.name, payload.quantity)

                        result = {
                            success: true,
                            message: `Purchased ${payload.quantity}x ${foodItem.name}`,
                            data: {
                                itemType: payload.itemType,
                                itemName: payload.itemName || foodItem.name,
                                quantity: payload.quantity,
                                totalCost,
                                newTokenBalance: player.tokens,
                            },
                            player,
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Failed to handle purchase food: ${error.message}`, error.stack)
            result = {
                success: false,
                message: "Failed to purchase food",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }

        // Emit response event - room will handle sending the response
        this.eventEmitter.emit(GameFoodEvent.PurchaseResponse, {
            client: payload.client,
            sessionId: payload.sessionId,
            result,
        } as PurchaseFoodResponsePayload)
    }

    @OnEvent(GameFoodEvent.GetCatalogRequested)
    async onGetCatalog(payload: GetCatalogPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.GetCatalogRequested}`)
        let result: GetCatalogResult

        try {
            const catalog = this.getFoodItems()

            result = {
                success: true,
                message: "Store catalog retrieved successfully",
                data: { catalog },
            }
        } catch (error) {
            this.logger.error(`Failed to handle get catalog: ${error.message}`, error.stack)
            result = {
                success: false,
                message: "Failed to get store catalog",
                error: "Failed to get store catalog",
            }
        }

        // Emit response event - room will handle sending the response
        this.eventEmitter.emit(GameFoodEvent.GetCatalogResponse, {
            client: payload.client,
            sessionId: payload.sessionId,
            result,
        } as GetCatalogResponsePayload)
    }

    @OnEvent(GameFoodEvent.GetInventoryRequested)
    async onGetInventory(payload: GetFoodInventoryPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.GetInventoryRequested}`)
        let result: GetFoodInventoryResult

        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                result = {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            } else {
                // Get inventory summary
                const inventorySummary = this.getInventorySummary(player)

                result = {
                    success: true,
                    message: "Inventory retrieved successfully",
                    data: { inventory: inventorySummary as unknown as Record<string, unknown> },
                    player,
                }
            }
        } catch (error) {
            this.logger.error(`Failed to handle get inventory: ${error.message}`, error.stack)
            result = {
                success: false,
                message: "Failed to get inventory",
                error: "Failed to get inventory",
            }
        }

        // Emit response event - room will handle sending the response
        this.eventEmitter.emit(GameFoodEvent.GetInventoryResponse, {
            client: payload.client,
            sessionId: payload.sessionId,
            result,
        } as GetFoodInventoryResponsePayload)
    }

    @OnEvent(GameFoodEvent.FeedPetRequested)
    async onFeedPet(payload: FeedPetWithFoodPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.FeedPetRequested}`)
        let result: FeedPetWithFoodResult

        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                result = {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            } else {
                // Validate food type
                if (!this.isValidFoodType(payload.foodType)) {
                    result = {
                        success: false,
                        message: "Invalid food type",
                        error: "Invalid food type",
                        player,
                    }
                } else {
                    // Check if player has the food item in inventory
                    const foodQuantity = this.getItemQuantity(player, "food", payload.foodType)
                    if (foodQuantity < payload.quantity) {
                        result = {
                            success: false,
                            message: `Not enough ${payload.foodType}. Have ${foodQuantity}, need ${payload.quantity}`,
                            error: `Not enough ${payload.foodType}. Have ${foodQuantity}, need ${payload.quantity}`,
                            player,
                        }
                    } else {
                        // Get pet from room state
                        const pet = payload.room.state.pets.get(payload.petId) as PetColyseusSchema
                        if (!pet) {
                            result = {
                                success: false,
                                message: "Pet not found",
                                error: "Pet not found",
                                player,
                            }
                        } else {
                            // Use food from inventory
                            const used = this.useItem(player, "food", payload.foodType, payload.quantity)
                            if (!used) {
                                result = {
                                    success: false,
                                    message: "Failed to use food from inventory",
                                    error: "Failed to use food from inventory",
                                    player,
                                }
                            } else {
                                // Feed the pet using state management method
                                const stateRoom = payload.room as unknown as StateRoom
                                const nutrition = this.getFoodNutrition(payload.foodType)
                                const totalNutrition = nutrition * payload.quantity

                                if (stateRoom.feedPetState) {
                                    stateRoom.feedPetState(pet, totalNutrition)
                                } else {
                                    // Fallback
                                    pet.hunger = Math.min(100, pet.hunger + totalNutrition)
                                    pet.happiness = Math.min(100, pet.happiness + totalNutrition * 0.5)
                                    pet.lastUpdated = Date.now()
                                }

                                // Update player's pet reference
                                if (player.pets && player.pets.has(payload.petId)) {
                                    const playerPet = player.pets.get(payload.petId)
                                    if (playerPet) {
                                        playerPet.hunger = pet.hunger
                                        playerPet.happiness = pet.happiness
                                        playerPet.lastUpdated = pet.lastUpdated
                                    }
                                }

                                // Get inventory summary after using food
                                const inventorySummary = this.getInventorySummary(player)

                                // Get pet stats summary
                                let petStatsSummary
                                if (stateRoom.getPetStatsSummary) {
                                    petStatsSummary = stateRoom.getPetStatsSummary(pet)
                                } else {
                                    petStatsSummary = {
                                        id: pet.id,
                                        petType: pet.petType,
                                        hunger: Math.round(pet.hunger),
                                        happiness: Math.round(pet.happiness),
                                        cleanliness: Math.round(pet.cleanliness || 100),
                                        overallHealth: Math.round(
                                            (pet.hunger + pet.happiness + (pet.cleanliness || 100)) / 3,
                                        ),
                                        lastUpdated: pet.lastUpdated,
                                        poops: pet.poops || [],
                                    }
                                }

                                result = {
                                    success: true,
                                    message: `Fed ${payload.quantity}x ${payload.foodType} to pet`,
                                    data: {
                                        petId: payload.petId,
                                        foodType: payload.foodType,
                                        quantity: payload.quantity,
                                        nutrition: totalNutrition,
                                        petStats: petStatsSummary,
                                        inventory: inventorySummary as unknown as Record<string, unknown>,
                                    },
                                    player,
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            result = {
                success: false,
                message: "Failed to feed pet",
                error: error instanceof Error ? error.message : "Failed to feed pet",
            }
        }

        // Emit response event - room will handle sending the response
        this.eventEmitter.emit(GameFoodEvent.FeedPetResponse, {
            client: payload.client,
            sessionId: payload.sessionId,
            result,
        } as FeedPetWithFoodResponsePayload)
    }

    // Helper methods
    private getPlayer(state: GameRoomColyseusSchema, sessionId: string): PlayerColyseusSchema | undefined {
        return state.players.get(sessionId)
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

    // Use item from inventory (decrease quantity)
    private useItem(player: PlayerColyseusSchema, itemType: string, itemName: string, quantity: number = 1): boolean {
        const itemKey = `${itemType}_${itemName}`
        const inventoryItem = player.inventory.get(itemKey)

        if (!inventoryItem || inventoryItem.quantity < quantity) {
            this.logger.debug(
                `${player.sessionId} doesn't have enough ${itemName}. Has: ${inventoryItem?.quantity || 0}, needs: ${quantity}`,
            )
            return false
        }

        inventoryItem.quantity -= quantity
        this.logger.debug(`${player.sessionId} used ${quantity}x ${itemName}. Remaining: ${inventoryItem.quantity}`)

        // Remove item from inventory if quantity reaches 0
        if (inventoryItem.quantity <= 0) {
            player.inventory.delete(itemKey)
            this.logger.debug(`Removed ${itemName} from inventory (quantity reached 0)`)
        }

        return true
    }

    // Get item quantity
    private getItemQuantity(player: PlayerColyseusSchema, itemType: string, itemName: string): number {
        const itemKey = `${itemType}_${itemName}`
        const inventoryItem = player.inventory.get(itemKey)
        return inventoryItem ? inventoryItem.quantity : 0
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
