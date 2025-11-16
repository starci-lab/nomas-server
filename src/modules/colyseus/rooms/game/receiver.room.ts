import {
    GameActionReceiveMessage,
    GameActionRequestMessage,
    ReceiveBuyPetPayload,
    ReceiveGetCatalogPayload,
    ReceiveGetInventoryPayload,
    ReceiveBuyFoodPayload,
    ReceiveGetStoreCatalogPayload,
    ReceiveGetFoodInventoryPayload,
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
import { AbstractStateManagementGameRoom } from "./state-management.room"
import { Client } from "colyseus"

export interface RegisterHandler {
    messageType: GameActionReceiveMessage
    handler: (client: Client, data: unknown) => void
}
export abstract class AbstractReceiverGameRoom extends AbstractStateManagementGameRoom {
    protected readonly registers: Array<RegisterHandler> = [
        // Pet handlers
        {
            messageType: GameActionReceiveMessage.BuyPet,
            handler: (client: Client, data: ReceiveBuyPetPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.BuyPet, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.GetCatalog,
            handler: (client: Client, data: ReceiveGetCatalogPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.GetCatalog, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.GetInventory,
            handler: (client: Client, data: ReceiveGetInventoryPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.GetInventory, {
                    client,
                    data,
                })
            },
        },
        // Food handlers
        {
            messageType: GameActionReceiveMessage.BuyFood,
            handler: (client: Client, data: ReceiveBuyFoodPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.BuyFood, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.GetStoreCatalog,
            handler: (client: Client, data: ReceiveGetStoreCatalogPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.GetStoreCatalog, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.GetFoodInventory,
            handler: (client: Client, data: ReceiveGetFoodInventoryPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.GetFoodInventory, {
                    client,
                    data,
                })
            },
        },
        {
            messageType: GameActionReceiveMessage.FeedPet,
            handler: (client: Client, data: ReceiveFeedPetPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.FeedPet, {
                    client,
                    data,
                })
            },
        },
        // Inventory handlers
        {
            messageType: GameActionReceiveMessage.PurchaseItem,
            handler: (client: Client, data: ReceivePurchaseItemPayload) => {
                this.eventEmitter.emit(GameActionRequestMessage.PurchaseItem, {
                    client,
                    data,
                })
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
