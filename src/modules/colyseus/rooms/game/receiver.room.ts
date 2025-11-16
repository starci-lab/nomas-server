import {
    GameActionReceiveMessage,
    GameActionRequestMessage,
    ReceiveBuyPetPayload,
    ReceiveBuyFoodPayload,
    ReceiveFeedPetPayload,
    ReceivePurchaseItemPayload,
    ReceiveRequestGameConfigPayload,
    ReceiveRequestPlayerStatePayload,
    ReceiveGetProfilePayload,
    ReceiveRequestPetsStatePayload,
    ReceiveClaimDailyRewardPayload,
    ReceiveUpdateSettingsPayload,
    ReceiveUpdateTutorialPayload,
} from "@modules/colyseus/events"
import { AbstractPetStateGameRoom } from "./state-pet.room"
import { Client } from "colyseus"
import { GamePetEvent, GameFoodEvent, GameInventoryEvent } from "@modules/colyseus/events"
import { BuyPetPayload } from "@modules/colyseus/handlers/pet/types"
import {
    PurchaseFoodPayload,
    GetCatalogPayload,
    GetFoodInventoryPayload,
    FeedPetWithFoodPayload,
} from "@modules/colyseus/handlers/food/types"
import { PurchaseInventoryItemPayload, GetInventoryPayload } from "@modules/colyseus/handlers/inventory/types"
import type { GameRoom } from "../game"

export interface RegisterHandler {
    messageType: GameActionReceiveMessage
    handler: (client: Client, data: unknown) => void
}
export abstract class AbstractReceiverGameRoom extends AbstractPetStateGameRoom {
    protected readonly registers: Array<RegisterHandler> = [
        // Pet handlers - convert to GamePetEvent
        {
            messageType: GameActionReceiveMessage.BuyPet,
            handler: (client: Client, data: ReceiveBuyPetPayload) => {
                const payload: BuyPetPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    petType: data.petType,
                    petTypeId: data.petTypeId,
                    isBuyPet: data.isBuyPet,
                }
                this.eventEmitter.emit(GamePetEvent.BuyRequested, payload)
            },
        },
        // Note: Other pet actions (RemovePet, PlayPet, CleanPet, etc.) are handled via FeedPet message
        // or will be added to GameActionReceiveMessage enum when needed
        // Food handlers - convert to GameFoodEvent
        {
            messageType: GameActionReceiveMessage.BuyFood,
            handler: (client: Client, data: ReceiveBuyFoodPayload) => {
                if (!data.itemId || !data.itemType || !data.itemName || !data.quantity) {
                    this.logger.debug("purchaseItem invoked without required data", data)
                    return
                }
                const payload: PurchaseFoodPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    itemId: data.itemId,
                    itemType: data.itemType,
                    itemName: data.itemName,
                    quantity: data.quantity,
                }
                this.eventEmitter.emit(GameFoodEvent.PurchaseRequested, payload)
            },
        },
        {
            messageType: GameActionReceiveMessage.GetStoreCatalog,
            handler: (client: Client) => {
                const payload: GetCatalogPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                }
                this.eventEmitter.emit(GameFoodEvent.GetCatalogRequested, payload)
            },
        },
        {
            messageType: GameActionReceiveMessage.GetFoodInventory,
            handler: (client: Client) => {
                const payload: GetFoodInventoryPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                }
                this.eventEmitter.emit(GameFoodEvent.GetInventoryRequested, payload)
            },
        },
        {
            messageType: GameActionReceiveMessage.FeedPet,
            handler: (client: Client, data: ReceiveFeedPetPayload) => {
                if (!data.petId || !data.foodType || !data.quantity) {
                    this.logger.warn("feedPet invoked without required data", data)
                    return
                }
                const payload: FeedPetWithFoodPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    petId: data.petId,
                    foodType: data.foodType,
                    quantity: data.quantity,
                }
                this.eventEmitter.emit(GameFoodEvent.FeedPetRequested, payload)
            },
        },
        // Inventory handlers - convert to GameInventoryEvent
        {
            messageType: GameActionReceiveMessage.PurchaseItem,
            handler: (client: Client, data: ReceivePurchaseItemPayload) => {
                if (!data.itemId || !data.itemType || !data.quantity) {
                    this.logger.warn("purchaseItem invoked without required data", data)
                    return
                }
                const payload: PurchaseInventoryItemPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    itemId: data.itemId,
                    itemType: data.itemType,
                    quantity: data.quantity,
                }
                this.eventEmitter.emit(GameInventoryEvent.PurchaseItemRequested, payload)
            },
        },
        {
            messageType: GameActionReceiveMessage.GetInventory,
            handler: (client: Client) => {
                const payload: GetInventoryPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                }
                this.eventEmitter.emit(GameInventoryEvent.GetInventoryRequested, payload)
            },
        },
        // Player handlers
        {
            messageType: GameActionReceiveMessage.RequestGameConfig,
            handler: (client: Client, data: ReceiveRequestGameConfigPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.RequestGameConfig, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.RequestPlayerState,
            handler: (client: Client, data: ReceiveRequestPlayerStatePayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.RequestPlayerState, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.GetProfile,
            handler: (client: Client, data: ReceiveGetProfilePayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.GetProfile, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.RequestPetsState,
            handler: (client: Client, data: ReceiveRequestPetsStatePayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.RequestPetsState, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.ClaimDailyReward,
            handler: (client: Client, data: ReceiveClaimDailyRewardPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.ClaimDailyReward, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.UpdateSettings,
            handler: (client: Client, data: ReceiveUpdateSettingsPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.UpdateSettings, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.UpdateTutorial,
            handler: (client: Client, data: ReceiveUpdateTutorialPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.UpdateTutorial, {
                    client,
                    data,
                })
            },
        },
    ]

    protected registerReceiverHandlers() {
        this.registers.forEach((register) => {
            this.onMessage(register.messageType, register.handler)
        })
    }
}
