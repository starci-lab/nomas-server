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
import { PlayerColyseusSchema, PetColyseusSchema } from "../../schemas"
import { OnRoomEvent } from "../../decorators"
import { GameInventoryEvent, GameFoodEvent, GamePetEvent, GamePlayerEvent } from "@modules/colyseus/events"
import {
    PurchaseInventoryItemResponsePayload,
    GetInventoryResponsePayload,
} from "@modules/colyseus/handlers/inventory/types"
import {
    PurchaseFoodResponsePayload,
    GetCatalogResponsePayload,
    GetFoodInventoryResponsePayload,
    FeedPetWithFoodResponsePayload,
} from "@modules/colyseus/handlers/food/types"
import {
    BuyPetResponsePayload,
    RemovePetResponsePayload,
    FeedPetResponsePayload,
    PlayPetResponsePayload,
    CleanPetResponsePayload,
    CleanedPetResponsePayload,
    CreatePoopResponsePayload,
    FoodConsumedResponsePayload,
} from "@modules/colyseus/handlers/pet/types"
import {
    GetGameConfigResponsePayload,
    GetPlayerStateResponsePayload,
    GetProfileResponsePayload,
    GetPetsStateResponsePayload,
    ClaimDailyRewardResponsePayload,
    UpdateSettingsResponsePayload,
    UpdateTutorialResponsePayload,
} from "@modules/colyseus/handlers/player/types"

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

    // ============================================================================
    // Response Event Bridge - Connects Event System to Sending Methods
    // ============================================================================
    // Responsibility: Listen to response events from event handlers and convert
    // them to send payloads, then delegate to send methods.
    //
    // Note: This is a bridge layer between the event-driven system (Receiver Room)
    // and the sending methods (this class). It maintains separation of concerns:
    // - Receiver Room: Handles incoming client messages → emits request events
    // - Event Handlers: Process business logic → emit response events
    // - This class: Listens response events → converts to send payloads → sends to client
    // ============================================================================

    @OnRoomEvent(GameInventoryEvent.PurchaseItemResponse)
    onPurchaseItemResponse(payload: PurchaseInventoryItemResponsePayload) {
        const sendPayload: SendPurchaseResponsePayload = {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        }
        this.sendPurchaseResponse(payload.client, sendPayload)
    }

    @OnRoomEvent(GameInventoryEvent.GetInventoryResponse)
    onGetInventoryResponse(payload: GetInventoryResponsePayload) {
        const sendPayload: SendInventoryResponsePayload = {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            tokens: payload.result.tokens,
            error: payload.result.error,
            timestamp: Date.now(),
        }
        this.sendInventoryResponse(payload.client, sendPayload)
    }

    @OnRoomEvent(GameFoodEvent.PurchaseResponse)
    onPurchaseFoodResponse(payload: PurchaseFoodResponsePayload) {
        const sendPayload: SendPurchaseResponsePayload = {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        }
        this.sendPurchaseResponse(payload.client, sendPayload)
    }

    @OnRoomEvent(GameFoodEvent.GetCatalogResponse)
    onGetCatalogResponse(payload: GetCatalogResponsePayload) {
        const sendPayload: SendStoreCatalogPayload = {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        }
        this.sendStoreCatalog(payload.client, sendPayload)
    }

    @OnRoomEvent(GameFoodEvent.GetInventoryResponse)
    onGetFoodInventoryResponse(payload: GetFoodInventoryResponsePayload) {
        const sendPayload: SendFoodInventoryPayload = {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        }
        this.sendFoodInventory(payload.client, sendPayload)
    }

    @OnRoomEvent(GameFoodEvent.FeedPetResponse)
    onFeedPetResponse(payload: FeedPetWithFoodResponsePayload) {
        const sendPayload: SendFeedResultPayload = {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        }
        this.sendFeedResult(payload.client, sendPayload)
    }

    // Pet response event handlers
    @OnRoomEvent(GamePetEvent.BuyResponse)
    onBuyPetResponse(payload: BuyPetResponsePayload) {
        this.sendBuyPetResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
        if (payload.result.player) {
            this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
        }
    }

    @OnRoomEvent(GamePetEvent.EatedFoodResponse)
    onEatedFoodResponse(payload: FoodConsumedResponsePayload) {
        this.sendActionResponse(payload.client, {
            success: payload.result?.success ?? false,
            message: payload.result?.message ?? "",
            data: payload.result?.data ?? undefined,
            error: payload.result?.error ?? undefined,
            timestamp: Date.now(),
        })
    }

    // @OnRoomEvent(GamePetEvent.CleanedPetResponse)
    // onCleanedPetResponse(payload: CleanedPetResponsePayload) {
    //     this.sendCleanedPetResponse(payload.client, {
    //         success: payload.result?.success ?? false,
    //         message: payload.result?.message ?? "",
    //         data: payload.result?.data ?? undefined,
    //         error: payload.result?.error ?? undefined,
    //         timestamp: Date.now(),
    //     })
    //     if (payload.result?.player) {
    //         this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
    //     }
    // }

    @OnRoomEvent(GamePetEvent.RemoveResponse)
    onRemovePetResponse(payload: RemovePetResponsePayload) {
        this.sendRemovePetResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
        if (payload.result.player) {
            this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
        }
    }

    @OnRoomEvent(GamePetEvent.FeedResponse)
    onPetFeedResponse(payload: FeedPetResponsePayload) {
        this.sendActionResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
        if (payload.result.player) {
            this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
        }
    }

    @OnRoomEvent(GamePetEvent.PlayedResponse)
    onPlayPetResponse(payload: PlayPetResponsePayload) {
        this.sendActionResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
        if (payload.result.player) {
            this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
        }
    }

    @OnRoomEvent(GamePetEvent.CleanResponse)
    onCleanPetResponse(payload: CleanPetResponsePayload) {
        this.sendActionResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
        if (payload.result.player) {
            this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
        }
    }

    @OnRoomEvent(GamePetEvent.CleanedResponse)
    onCleanedPetResponse(payload: CleanedPetResponsePayload) {
        this.sendCleanedPetResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
        if (payload.result.player) {
            this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
        }
    }

    @OnRoomEvent(GamePetEvent.CreatePoopResponse)
    onCreatePoopResponse(payload: CreatePoopResponsePayload) {
        this.sendCreatePoopResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
        if (payload.result.player) {
            this.sendPetsStateSync(payload.client, this.mapPetsToSyncPayload(payload.result.player))
        }
    }

    // Player response event handlers
    @OnRoomEvent(GamePlayerEvent.GetGameConfigResponse)
    onGetGameConfigResponse(payload: GetGameConfigResponsePayload) {
        this.sendGameConfigResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            config: payload.result.config,
            error: payload.result.error,
            timestamp: Date.now(),
        })
    }

    @OnRoomEvent(GamePlayerEvent.GetPlayerStateResponse)
    onGetPlayerStateResponse(payload: GetPlayerStateResponsePayload) {
        this.sendPlayerStateResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
    }

    @OnRoomEvent(GamePlayerEvent.GetProfileResponse)
    onGetProfileResponse(payload: GetProfileResponsePayload) {
        this.sendProfileResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
    }

    @OnRoomEvent(GamePlayerEvent.GetPetsStateResponse)
    onGetPetsStateResponse(payload: GetPetsStateResponsePayload) {
        this.sendPetsStateResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data
                ? { pets: payload.result.data.pets.map((pet) => pet as unknown as Record<string, unknown>) }
                : undefined,
            error: payload.result.error,
            timestamp: Date.now(),
        })
    }

    @OnRoomEvent(GamePlayerEvent.ClaimDailyRewardResponse)
    onClaimDailyRewardResponse(payload: ClaimDailyRewardResponsePayload) {
        this.sendDailyRewardResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
    }

    @OnRoomEvent(GamePlayerEvent.UpdateSettingsResponse)
    onUpdateSettingsResponse(payload: UpdateSettingsResponsePayload) {
        this.sendSettingsResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
    }

    @OnRoomEvent(GamePlayerEvent.UpdateTutorialResponse)
    onUpdateTutorialResponse(payload: UpdateTutorialResponsePayload) {
        this.sendTutorialResponse(payload.client, {
            success: payload.result.success,
            message: payload.result.message,
            data: payload.result.data,
            error: payload.result.error,
            timestamp: Date.now(),
        })
    }

    // Helper method to map pets to sync payload
    private mapPetsToSyncPayload(player: PlayerColyseusSchema): SendPetsStateSyncPayload {
        const pets: PetColyseusSchema[] = []
        if (player.pets) {
            player.pets.forEach((pet: PetColyseusSchema) => pets.push(pet))
        }
        return {
            pets: pets.map((pet: PetColyseusSchema) => ({
                id: pet.id,
                ownerId: pet.ownerId,
                petType: pet.petType,
                hunger: pet.hunger,
                happiness: pet.happiness,
                cleanliness: pet.cleanliness,
                lastUpdated: pet.lastUpdated,
            })),
            timestamp: Date.now(),
        }
    }
}
