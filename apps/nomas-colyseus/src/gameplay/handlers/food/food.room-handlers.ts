import { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"
import { GameFoodMessages, GameFoodEvent } from "@modules/gameplay"
import { FoodMessageHandlers } from "./food.message-handlers"

/**
 * Food Room Handlers - Registers all food-related message handlers to the room
 */
export class FoodRoomHandlers {
    constructor(
        private room: GameRoom,
        private foodMessages: FoodMessageHandlers,
    ) {}

    register() {
        // Buy Food
        this.room.onMessage(
            GameFoodMessages.BUY_FOOD,
            async (
                client: Client,
                data: { itemId?: string; itemType?: string; itemName?: string; quantity?: number } = {},
            ) => {
                const payload = this.foodMessages.purchaseItem(this.room)(client, data)
                if (payload && this.room.eventEmitterService) {
                    await this.room.eventEmitterService.emit(GameFoodEvent.PurchaseRequested, payload)
                }
            },
        )

        // Get Catalog
        this.room.onMessage(GameFoodMessages.GET_CATALOG, async (client: Client) => {
            const payload = this.foodMessages.getCatalog(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GameFoodEvent.GetCatalogRequested, payload)
            }
        })

        // Get Inventory
        this.room.onMessage(GameFoodMessages.GET_INVENTORY, async (client: Client) => {
            const payload = this.foodMessages.getInventory(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GameFoodEvent.GetInventoryRequested, payload)
            }
        })

        // Feed Pet With Food
        this.room.onMessage(
            GameFoodMessages.FEED_PET,
            async (client: Client, data: { petId?: string; foodType?: string; quantity?: number } = {}) => {
                const payload = this.foodMessages.feedPet(this.room)(client, data)
                if (payload && this.room.eventEmitterService) {
                    await this.room.eventEmitterService.emit(GameFoodEvent.FeedPetRequested, payload)
                }
            },
        )
    }
}
