import { Injectable, Logger } from "@nestjs/common"
import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game"
import { PurchaseFoodPayload, GetCatalogPayload, GetInventoryPayload, FeedPetWithFoodPayload } from "@modules/gameplay"

interface PurchaseFoodMessage {
    itemId?: string
    itemType?: string
    itemName?: string
    quantity?: number
}

@Injectable()
export class FoodMessageHandlers {
    private readonly logger = new Logger(FoodMessageHandlers.name)

    purchaseItem(room: GameRoom) {
        return (client: Client, data: PurchaseFoodMessage = {}): PurchaseFoodPayload | null => {
            if (!data.itemId || !data.itemType || !data.itemName || !data.quantity) {
                this.logger.debug("purchaseItem invoked without required data", data)
                return null
            }
            return {
                room,
                client,
                sessionId: client.sessionId,
                itemId: data.itemId,
                itemType: data.itemType,
                itemName: data.itemName,
                quantity: data.quantity,
            }
        }
    }

    getCatalog(room: GameRoom) {
        return (client: Client): GetCatalogPayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
            }
        }
    }

    getInventory(room: GameRoom) {
        return (client: Client): GetInventoryPayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
            }
        }
    }

    feedPet(room: GameRoom) {
        return (
            client: Client,
            data: { petId?: string; foodType?: string; quantity?: number } = {},
        ): FeedPetWithFoodPayload | null => {
            if (!data.petId || !data.foodType || !data.quantity) {
                this.logger.warn("feedPet invoked without required data", data)
                return null
            }
            return {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.petId,
                foodType: data.foodType,
                quantity: data.quantity,
            }
        }
    }
}
