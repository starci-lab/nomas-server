import { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game"
import { FoodMessageHandlers } from "./food.message-handlers"
import { GameActionRequestMessage } from "@modules/gameplay/events"

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
            GameActionRequestMessage.BuyFood,
            async (
                client: Client,
                data: { itemId?: string; itemType?: string; itemName?: string; quantity?: number } = {},
            ) => {
                const payload = this.foodMessages.purchaseItem(this.room)(client, data)
                if (payload && this.room.eventEmitterService) {
                    await this.room.eventEmitterService.emit(GameActionRequestMessage.Purchase, payload)
                }
            },
        )

        // Get Catalog
        this.room.onMessage(GameActionRequestMessage.GetCatalog, async (client: Client) => {
            const payload = this.foodMessages.getCatalog(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GameActionRequestMessage.BuyFood, payload)
            }
        })

        // Get Inventory
        this.room.onMessage(GameActionRequestMessage.GetInventory, async (client: Client) => {
            const payload = this.foodMessages.getInventory(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GameActionRequestMessage.BuyFood, payload)
            }
        })

        // Feed Pet With Food
        this.room.onMessage(
            GameActionRequestMessage.BuyFood,
            async (client: Client, data: { petId?: string; foodType?: string; quantity?: number } = {}) => {
                const payload = this.foodMessages.feedPet(this.room)(client, data)
                if (payload && this.room.eventEmitterService) {
                    await this.room.eventEmitterService.emit(GameActionRequestMessage.BuyFood, payload)
                }
            },
        )
    }
}
