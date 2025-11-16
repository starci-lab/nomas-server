import { Client } from "colyseus"
import {
    GameActionSendMessage,
    SendCatalogPayload,
    SendInventoryPayload,
    SendWelcomePayload,
    SendStoreCatalogPayload,
    SendFoodInventoryPayload,
    SendFeedResultPayload,
    SendPurchaseResponsePayload,
    SendInventoryResponsePayload,
    SendGameConfigResponsePayload,
    SendPlayerStateResponsePayload,
    SendProfileResponsePayload,
    SendPetsStateResponsePayload,
    SendDailyRewardResponsePayload,
    SendSettingsResponsePayload,
    SendTutorialResponsePayload,
    SendBuyPetResponsePayload,
    SendRemovePetResponsePayload,
    SendCleanedPetResponsePayload,
    SendCreatePoopResponsePayload,
    SendActionResponsePayload,
    SendPetsStateSyncPayload,
} from "../../events"
import { AbstractReceiverGameRoom } from "./receiver.room"
import { PlayerColyseusSchema } from "../../schemas"

export abstract class AbstractSenderGameRoom extends AbstractReceiverGameRoom {
    protected sendWelcomeMessage(client: Client, player: PlayerColyseusSchema) {
        const payload: SendWelcomePayload = {
            message: `Welcome to ${this.state.roomName}, ${player.walletAddress}!`,
            roomId: this.roomId,
        }
        client.send(GameActionSendMessage.Welcome, payload)
    }

    protected sendCatalog(client: Client, catalog: SendCatalogPayload) {
        client.send(GameActionSendMessage.Catalog, catalog)
    }

    protected sendInventory(client: Client, inventory: SendInventoryPayload) {
        client.send(GameActionSendMessage.GetInventory, inventory)
    }

    // Food send methods
    protected sendStoreCatalog(client: Client, payload: SendStoreCatalogPayload) {
        client.send(GameActionSendMessage.StoreCatalog, payload)
    }

    protected sendFoodInventory(client: Client, payload: SendFoodInventoryPayload) {
        client.send(GameActionSendMessage.FoodInventory, payload)
    }

    protected sendFeedResult(client: Client, payload: SendFeedResultPayload) {
        client.send(GameActionSendMessage.FeedResult, payload)
    }

    // Inventory send methods
    protected sendPurchaseResponse(client: Client, payload: SendPurchaseResponsePayload) {
        client.send(GameActionSendMessage.PurchaseResponse, payload)
    }

    protected sendInventoryResponse(client: Client, payload: SendInventoryResponsePayload) {
        client.send(GameActionSendMessage.InventoryResponse, payload)
    }

    // Player send methods
    protected sendGameConfigResponse(client: Client, payload: SendGameConfigResponsePayload) {
        client.send(GameActionSendMessage.GameConfigResponse, payload)
    }

    protected sendPlayerStateResponse(client: Client, payload: SendPlayerStateResponsePayload) {
        client.send(GameActionSendMessage.PlayerStateResponse, payload)
    }

    protected sendProfileResponse(client: Client, payload: SendProfileResponsePayload) {
        client.send(GameActionSendMessage.ProfileResponse, payload)
    }

    protected sendPetsStateResponse(client: Client, payload: SendPetsStateResponsePayload) {
        client.send(GameActionSendMessage.PetsStateResponse, payload)
    }

    protected sendDailyRewardResponse(client: Client, payload: SendDailyRewardResponsePayload) {
        client.send(GameActionSendMessage.DailyRewardResponse, payload)
    }

    protected sendSettingsResponse(client: Client, payload: SendSettingsResponsePayload) {
        client.send(GameActionSendMessage.SettingsResponse, payload)
    }

    protected sendTutorialResponse(client: Client, payload: SendTutorialResponsePayload) {
        client.send(GameActionSendMessage.TutorialResponse, payload)
    }

    // Pet send methods
    protected sendBuyPetResponse(client: Client, payload: SendBuyPetResponsePayload) {
        client.send(GameActionSendMessage.BuyPetResponse, payload)
    }

    protected sendRemovePetResponse(client: Client, payload: SendRemovePetResponsePayload) {
        client.send(GameActionSendMessage.RemovePetResponse, payload)
    }

    protected sendCleanedPetResponse(client: Client, payload: SendCleanedPetResponsePayload) {
        client.send(GameActionSendMessage.CleanedPetResponse, payload)
    }

    protected sendCreatePoopResponse(client: Client, payload: SendCreatePoopResponsePayload) {
        client.send(GameActionSendMessage.CreatePoopResponse, payload)
    }

    protected sendActionResponse(client: Client, payload: SendActionResponsePayload) {
        client.send(GameActionSendMessage.ActionResponse, payload)
    }

    protected sendPetsStateSync(client: Client, payload: SendPetsStateSyncPayload) {
        client.send(GameActionSendMessage.PetsStateSync, payload)
    }
}
