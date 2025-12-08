import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import {
    PurchaseFoodPayload,
    GetFoodInventoryPayload,
    FeedPetWithFoodPayload,
    PurchaseFoodResult,
    GetCatalogResult,
    GetFoodInventoryResult,
    FeedPetWithFoodResult,
    StateRoom,
    InventorySummary,
    GetCatalogPayload,
} from "./types"
import {
    GameRoomColyseusSchema,
    PlayerColyseusSchema,
    PetColyseusSchema,
    InventoryItemColyseusSchema,
} from "@modules/colyseus/schemas"
import { TrackGameAction } from "@modules/prometheus/decorators"
import { FoodSyncService } from "./food-sync.service"
import { MemdbStorageService } from "@modules/databases"

/**
 * Food Handler - Pure business logic layer
 * Handles all food-related game logic and returns results
 */
@Injectable()
export class FoodHandler {
    private readonly logger = new Logger(FoodHandler.name)
    constructor(
        @Inject(forwardRef(() => FoodSyncService)) private readonly foodSyncService: FoodSyncService,
        private readonly memdbStorageService: MemdbStorageService,
    ) {}

    // Get food item from DB storage
    private getFoodItem(itemType: string) {
        return this.memdbStorageService
            .getStoreItems()
            .find((item) => item.displayId.toLocaleLowerCase() === itemType && item.type === "food")
    }

    // Get nutrition value for a food type
    private getFoodNutrition(foodType: string): number {
        const foodItem = this.getFoodItem(foodType)
        return foodItem?.effectHunger || 10
    }

    // Validate if food type exists
    private isValidFoodType(foodType: string): boolean {
        return this.getFoodItem(foodType) !== undefined
    }

    @TrackGameAction("food_purchased", { labels: ["food_type"], trackDuration: true })
    async handlePurchaseFood(payload: PurchaseFoodPayload): Promise<PurchaseFoodResult> {
        this.logger.debug(`Handling purchase food: ${payload.itemType}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            }

            // Validate food type
            // if (!this.isValidFoodType(payload.itemType)) {
            //     return {
            //         success: false,
            //         message: "Invalid food type",
            //         error: "Invalid food type",
            //         player,
            //     }
            // }

            // Purchase food with transaction (atomic operation with rollback)
            const result = await this.foodSyncService.purchaseFoodWithTransaction(player, {
                // itemType: payload.itemType,
                quantity: payload.quantity,
                displayId: payload.itemName,
            })

            if (!result) {
                return {
                    success: false,
                    message: "Failed to purchase food - transaction failed",
                    error: "Transaction failed, food not found, or not enough tokens",
                    player,
                }
            }

            // Update player tokens in memory state
            player.tokens = result.newTokenBalance

            // Add item to inventory (in-memory)
            this.addItem(player, "food", payload.itemType, payload.itemName || result.itemData.name, payload.quantity)

            return {
                success: true,
                message: `Purchased ${payload.quantity}x ${result.itemData.name}`,
                data: {
                    itemType: payload.itemType,
                    itemName: payload.itemName || result.itemData.name,
                    quantity: payload.quantity,
                    totalCost: result.totalCost,
                    newTokenBalance: player.tokens,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle purchase food: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to purchase food",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleGetCatalog(payload: GetCatalogPayload): Promise<GetCatalogResult> {
        this.logger.debug("Handling get catalog", payload)
        try {
            // Get food items from DB storage
            const foodItems = this.memdbStorageService.getStoreItems().filter((item) => item.type === "food")

            // Transform to catalog format
            const catalog = foodItems.reduce(
                (acc, item) => {
                    acc[item.displayId] = {
                        name: item.name,
                        price: item.costNom,
                        nutrition: item.effectHunger || 10,
                        description: item.description,
                    }
                    return acc
                },
                {} as Record<string, { price: number; nutrition: number; name: string; description?: string }>,
            )

            return {
                success: true,
                message: "Store catalog retrieved successfully",
                data: { catalog },
            }
        } catch (error) {
            this.logger.error(`Failed to handle get catalog: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to get store catalog",
                error: "Failed to get store catalog",
            }
        }
    }

    async handleGetInventory(payload: GetFoodInventoryPayload): Promise<GetFoodInventoryResult> {
        this.logger.debug("Handling get food inventory")
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            }

            // Get inventory summary
            const inventorySummary = this.getInventorySummary(player)

            return {
                success: true,
                message: "Inventory retrieved successfully",
                data: { inventory: inventorySummary as unknown as Record<string, unknown> },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle get inventory: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to get inventory",
                error: "Failed to get inventory",
            }
        }
    }

    async handleFeedPet(payload: FeedPetWithFoodPayload): Promise<FeedPetWithFoodResult> {
        this.logger.debug(`Handling feed pet: ${payload.petId} with ${payload.foodType}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            }

            // Validate food type
            if (!this.isValidFoodType(payload.foodType)) {
                return {
                    success: false,
                    message: "Invalid food type",
                    error: "Invalid food type",
                    player,
                }
            }

            // Check if player has the food item in inventory
            const foodQuantity = this.getItemQuantity(player, "food", payload.foodType)
            if (foodQuantity < payload.quantity) {
                return {
                    success: false,
                    message: `Not enough ${payload.foodType}. Have ${foodQuantity}, need ${payload.quantity}`,
                    error: `Not enough ${payload.foodType}. Have ${foodQuantity}, need ${payload.quantity}`,
                    player,
                }
            }

            // Get pet from room state
            const pet = payload.room.state.pets.get(payload.petId) as PetColyseusSchema
            if (!pet) {
                return {
                    success: false,
                    message: "Pet not found",
                    error: "Pet not found",
                    player,
                }
            }

            // Use food from inventory
            const used = this.useItem(player, "food", payload.foodType, payload.quantity)
            if (!used) {
                return {
                    success: false,
                    message: "Failed to use food from inventory",
                    error: "Failed to use food from inventory",
                    player,
                }
            }

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
                    overallHealth: Math.round((pet.hunger + pet.happiness + (pet.cleanliness || 100)) / 3),
                    lastUpdated: pet.lastUpdated,
                    poops: pet.poops || [],
                }
            }

            return {
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
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to feed pet",
                error: error instanceof Error ? error.message : "Failed to feed pet",
            }
        }
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
