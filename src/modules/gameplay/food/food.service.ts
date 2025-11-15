import { Injectable, Logger } from "@nestjs/common"
import { Client } from "colyseus"
import { GameRoomState } from "@modules/colyseus/schemas"
import { GameFoodActionMessages } from "./food.constants"
import { PurchaseFoodPayload, GetCatalogPayload, GetFoodInventoryPayload, FeedPetWithFoodPayload } from "./food.events"

type ActionResponsePayload = {
    success: boolean
    message: string
    data?: Record<string, unknown>
}

@Injectable()
export class FoodGameService {
    private readonly logger = new Logger(FoodGameService.name)

    async handlePurchaseItem({ room, client, sessionId, itemId, itemType, itemName, quantity }: PurchaseFoodPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GameFoodActionMessages.PURCHASE_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement purchase logic
        this.logger.warn("handlePurchaseItem not yet implemented")
        this.sendActionResponse(client, GameFoodActionMessages.PURCHASE_RESPONSE, {
            success: true,
            message: "Purchase item (placeholder)",
            data: { itemId, itemType, itemName, quantity },
        })
    }

    async handleGetCatalog({ client }: GetCatalogPayload) {
        // TODO: Implement get catalog logic
        this.logger.warn("handleGetCatalog not yet implemented")
        const catalog = {
            food: {
                hamburger: { price: 10, name: "Hamburger" },
                apple: { price: 5, name: "Apple" },
                fish: { price: 15, name: "Fish" },
            },
        }
        client.send(GameFoodActionMessages.CATALOG_RESPONSE, {
            success: true,
            catalog,
        })
    }

    async handleGetInventory({ room, client, sessionId }: GetFoodInventoryPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GameFoodActionMessages.INVENTORY_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement get inventory logic
        this.logger.warn("handleGetInventory not yet implemented")
        this.sendActionResponse(client, GameFoodActionMessages.INVENTORY_RESPONSE, {
            success: true,
            message: "Get inventory (placeholder)",
            data: { inventory: [] },
        })
    }

    async handleFeedPet({ room, client, sessionId, petId, foodType, quantity }: FeedPetWithFoodPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GameFoodActionMessages.FEED_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement feed pet logic
        this.logger.warn("handleFeedPet not yet implemented")
        this.sendActionResponse(client, GameFoodActionMessages.FEED_RESPONSE, {
            success: true,
            message: "Feed pet (placeholder)",
            data: { petId, foodType, quantity },
        })
    }

    private getPlayer(state: GameRoomState, sessionId: string) {
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
