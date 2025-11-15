import { Injectable, Logger } from "@nestjs/common"
import { Client } from "colyseus"
import { GameRoomColyseusSchema } from "@modules/colyseus/schemas"
import { GameActionResponseMessage } from "../events"
import { 
    PurchaseFoodPayload, 
    GetCatalogPayload, 
    GetFoodInventoryPayload, 
    FeedPetWithFoodPayload
} from "./food.events"
import { ActionResponsePayload } from "../events"

@Injectable()
export class FoodGameService {
    private readonly logger = new Logger(FoodGameService.name)

    async handlePurchaseItem(
        { 
            room, 
            client, 
            sessionId, 
            itemId, 
            itemType, 
            itemName, 
            quantity
        }: PurchaseFoodPayload) {
        const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
        if (!player) {
            this.sendActionResponse(client, GameActionResponseMessage.Purchase, {
                success: false,
                message: GameActionResponseMessage.Purchase,
            })
            return
        }

        // TODO: Implement purchase logic
        this.logger.debug("handlePurchaseItem not yet implemented")
        this.sendActionResponse(client, GameActionResponseMessage.Purchase, {
            success: true,
            message: GameActionResponseMessage.Purchase,
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
        client.send(GameActionResponseMessage.BuyFood, {
            success: true,
            message: GameActionResponseMessage.BuyFood,
            data: { catalog },
        })
    }

    async handleGetInventory({ room, client, sessionId }: GetFoodInventoryPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GameActionResponseMessage.BuyFood, {
                success: false,
                message: GameActionResponseMessage.BuyFood,
            })
            return
        }

        // TODO: Implement get inventory logic
        this.logger.warn("handleGetInventory not yet implemented")
        this.sendActionResponse(client, GameActionResponseMessage.BuyFood, {
            success: true,
            message: GameActionResponseMessage.BuyFood,
            data: { inventory: [] },
        })
    }

    async handleFeedPet({ room, client, sessionId, petId, foodType, quantity }: FeedPetWithFoodPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GameActionResponseMessage.BuyFood, {
                success: false,
                message: GameActionResponseMessage.BuyFood,
            })
            return
        }

        // TODO: Implement feed pet logic
        this.logger.warn("handleFeedPet not yet implemented")
        this.sendActionResponse(client, GameActionResponseMessage.BuyFood, {
            success: true,
            message: GameActionResponseMessage.BuyFood,
            data: { petId, foodType, quantity },
        })
    }

    private getPlayer(state: GameRoomState, sessionId: string) {
        return state.players.get(sessionId)
    }

    private sendActionResponse(client: Client, messageType: string, payload: ActionResponsePayload<Record<string, unknown>>) {
        client.send(messageType, {
            success: payload.success,
            message: payload.message,
            data: payload.data ?? {},
            timestamp: Date.now(),
        })
    }
}
