import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import { GameRoomColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { PurchaseFoodPayload, GetFoodInventoryPayload, FeedPetWithFoodPayload } from "./food.events"
import { InventoryGameService } from "../inventory/inventory.service"
import { PlayerGameService } from "../player/player.service"
import { PurchaseFoodResult, GetCatalogResult, GetFoodInventoryResult, FeedPetWithFoodResult } from "./food.results"
import { TrackGameAction } from "@modules/prometheus/decorators"

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

    constructor(
        private readonly inventoryService: InventoryGameService,
        @Inject(forwardRef(() => PlayerGameService)) private playerService: PlayerGameService,
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

    @TrackGameAction("food_purchased", { labels: ["itemType"], trackDuration: true })
    async handlePurchaseItem({
        room,
        sessionId,
        itemType,
        itemName,
        quantity,
    }: PurchaseFoodPayload): Promise<PurchaseFoodResult> {
        try {
            this.logger.debug(`🛒 [FoodGameService] Handling purchase item request: ${itemType} x${quantity}`)

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            }

            // Validate food type
            if (!this.isValidFoodType(itemType)) {
                return {
                    success: false,
                    message: "Invalid food type",
                    error: "Invalid food type",
                    player,
                }
            }

            // Get food item details
            const foodItem = this.getFoodItems()[itemType]
            const totalCost = foodItem.price * quantity

            // Check if player has enough tokens
            if (player.tokens < totalCost) {
                return {
                    success: false,
                    message: `Not enough tokens. Need ${totalCost}, have ${player.tokens}`,
                    error: `Not enough tokens. Need ${totalCost}, have ${player.tokens}`,
                    player,
                }
            }

            // Deduct tokens from player in state
            player.tokens -= totalCost

            // Sync tokens to DB immediately (tokens must be synced immediately for data integrity)
            await this.playerService.syncTokensToDB(player).catch((error) => {
                this.logger.error(`Failed to sync tokens to DB: ${error.message}`)
                // Continue even if sync fails - state is already updated
            })

            // Add item to inventory using InventoryGameService (only in state, synced later)
            const itemId = itemType // Use itemType as itemId for food items
            this.inventoryService.addItem(player, "food", itemId, itemName || foodItem.name, quantity)

            this.logger.debug(
                `✅ [FoodGameService] Purchase successful: ${itemType} x${quantity} for ${totalCost} tokens`,
            )

            return {
                success: true,
                message: `Purchased ${quantity}x ${foodItem.name}`,
                data: {
                    itemType,
                    itemName: itemName || foodItem.name,
                    quantity,
                    totalCost,
                    newTokenBalance: player.tokens,
                },
                player,
            }
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error purchasing item: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return {
                success: false,
                message: error instanceof Error ? error.message : "Purchase failed",
                error: error instanceof Error ? error.message : "Purchase failed",
            }
        }
    }

    async handleGetCatalog(): Promise<GetCatalogResult> {
        try {
            this.logger.debug("🏪 [FoodGameService] Handling get catalog request")

            const catalog = this.getFoodItems()

            return {
                success: true,
                message: "Store catalog retrieved successfully",
                data: { catalog },
            }
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error getting catalog: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return {
                success: false,
                message: "Failed to get store catalog",
                error: "Failed to get store catalog",
            }
        }
    }

    async handleGetInventory({ room, sessionId }: GetFoodInventoryPayload): Promise<GetFoodInventoryResult> {
        try {
            this.logger.debug("📦 [FoodGameService] Handling get inventory request")

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            }

            // Get inventory summary using InventoryGameService
            const inventorySummary = this.inventoryService.getInventorySummary(player)

            return {
                success: true,
                message: "Inventory retrieved successfully",
                data: { inventory: inventorySummary as unknown as Record<string, unknown> },
                player,
            }
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error getting inventory: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return {
                success: false,
                message: "Failed to get inventory",
                error: "Failed to get inventory",
            }
        }
    }

    async handleFeedPet({
        room,
        sessionId,
        petId,
        foodType,
        quantity,
    }: FeedPetWithFoodPayload): Promise<FeedPetWithFoodResult> {
        try {
            this.logger.debug(
                `🍽️ [FoodGameService] Handling feed pet request: petId=${petId}, foodType=${foodType}, quantity=${quantity}`,
            )

            const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found",
                    error: "Player not found",
                }
            }

            // Validate food type
            if (!this.isValidFoodType(foodType)) {
                return {
                    success: false,
                    message: "Invalid food type",
                    error: "Invalid food type",
                    player,
                }
            }

            // Check if player has the food item in inventory
            const foodQuantity = this.inventoryService.getItemQuantity(player, "food", foodType)
            if (foodQuantity < quantity) {
                return {
                    success: false,
                    message: `Not enough ${foodType}. Have ${foodQuantity}, need ${quantity}`,
                    error: `Not enough ${foodType}. Have ${foodQuantity}, need ${quantity}`,
                    player,
                }
            }

            // Get pet from room state
            const pet = room.state.pets.get(petId)
            if (!pet) {
                return {
                    success: false,
                    message: "Pet not found",
                    error: "Pet not found",
                    player,
                }
            }

            // Use food from inventory
            const used = this.inventoryService.useItem(player, "food", foodType, quantity)
            if (!used) {
                return {
                    success: false,
                    message: "Failed to use food from inventory",
                    error: "Failed to use food from inventory",
                    player,
                }
            }

            // Feed the pet using state management method
            const stateRoom = room as unknown as {
                feedPetState: (
                    pet: { hunger: number; happiness: number; lastUpdated: number },
                    foodValue?: number,
                ) => void
                getPetStatsSummary: (pet: {
                    id: string
                    petType: string
                    hunger: number
                    happiness: number
                    cleanliness: number
                    lastUpdated: number
                    poops?: Array<{ id: string; petId: string; positionX: number; positionY: number }>
                }) => {
                    id: string
                    petType: string
                    hunger: number
                    happiness: number
                    cleanliness: number
                    overallHealth: number
                    lastUpdated: number
                    poops: Array<{ id: string; petId: string; positionX: number; positionY: number }>
                }
            }
            const nutrition = this.getFoodNutrition(foodType)
            const totalNutrition = nutrition * quantity

            if (stateRoom.feedPetState) {
                stateRoom.feedPetState(pet, totalNutrition)
            } else {
                // Fallback
                pet.hunger = Math.min(100, pet.hunger + totalNutrition)
                pet.happiness = Math.min(100, pet.happiness + totalNutrition * 0.5)
                pet.lastUpdated = Date.now()
            }

            // Update player's pet reference
            if (player.pets && player.pets.has(petId)) {
                const playerPet = player.pets.get(petId)
                if (playerPet) {
                    playerPet.hunger = pet.hunger
                    playerPet.happiness = pet.happiness
                    playerPet.lastUpdated = pet.lastUpdated
                }
            }

            // Get inventory summary after using food
            const inventorySummary = this.inventoryService.getInventorySummary(player)

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
                message: `Fed ${quantity}x ${foodType} to pet`,
                data: {
                    petId,
                    foodType,
                    quantity,
                    nutrition: totalNutrition,
                    petStats: petStatsSummary,
                    inventory: inventorySummary as unknown as Record<string, unknown>,
                },
                player,
            }
        } catch (error) {
            this.logger.error(
                `❌ [FoodGameService] Error feeding pet: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to feed pet",
                error: error instanceof Error ? error.message : "Failed to feed pet",
            }
        }
    }

    private getPlayer(state: GameRoomColyseusSchema, sessionId: string): PlayerColyseusSchema | undefined {
        return state.players.get(sessionId)
    }
}
