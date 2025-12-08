import {
    GameActionReceiveMessage,
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
    ReceiveEatedFoodPayload,
} from "@modules/colyseus/events"
import { Client } from "colyseus"
import { GamePetEvent, GameFoodEvent, GameInventoryEvent, GamePlayerEvent } from "@modules/colyseus/events"
import {
    BuyPetPayload,
    BuyPetResponsePayload,
    CleanedPetPayload,
    CleanedPetResponsePayload,
    CreatePoopPayload,
    CreatePoopResponsePayload,
    FoodConsumedPayload,
    FoodConsumedResponsePayload,
    PlayedPetPayload,
    PlayedPetResponsePayload,
} from "@modules/colyseus/handlers/pet/types"
import { PetHandler } from "@modules/colyseus/handlers/pet"
import {
    PurchaseFoodPayload,
    GetCatalogPayload,
    GetFoodInventoryPayload,
    FeedPetWithFoodPayload,
    PurchaseFoodResponsePayload,
    GetCatalogResponsePayload,
    GetFoodInventoryResponsePayload,
    FeedPetWithFoodResponsePayload,
} from "@modules/colyseus/handlers/food/types"
import { FoodHandler } from "@modules/colyseus/handlers/food"
import {
    PurchaseInventoryItemPayload,
    GetInventoryPayload,
    PurchaseInventoryItemResponsePayload,
    GetInventoryResponsePayload,
} from "@modules/colyseus/handlers/inventory/types"
import { InventoryHandler } from "@modules/colyseus/handlers/inventory"
import {
    GetGameConfigPayload,
    GetPlayerStatePayload,
    GetProfilePayload,
    GetPetsStatePayload,
    ClaimDailyRewardPayload,
    UpdateSettingsPayload,
    UpdateTutorialPayload,
    GetGameConfigResponsePayload,
    GetPlayerStateResponsePayload,
    GetProfileResponsePayload,
    GetPetsStateResponsePayload,
    ClaimDailyRewardResponsePayload,
    UpdateSettingsResponsePayload,
    UpdateTutorialResponsePayload,
} from "@modules/colyseus/handlers/player/types"
import { PlayerHandler } from "@modules/colyseus/handlers/player"
import type { GameRoom } from "../game"
import { AbstractPetStateGameRoom } from "./state-pet.room"

export interface RegisterHandler {
    messageType: GameActionReceiveMessage
    handler: (client: Client, data: unknown) => void | Promise<void>
}
export abstract class AbstractReceiverGameRoom extends AbstractPetStateGameRoom {
    protected petHandler: PetHandler | null = null
    protected foodHandler: FoodHandler | null = null
    protected inventoryHandler: InventoryHandler | null = null
    protected playerHandler: PlayerHandler | null = null

    async initialize() {
        super.initialize()
        this.petHandler = this.app.get(PetHandler, { strict: false })
        this.foodHandler = this.app.get(FoodHandler, { strict: false })
        this.inventoryHandler = this.app.get(InventoryHandler, { strict: false })
        this.playerHandler = this.app.get(PlayerHandler, { strict: false })
    }

    protected readonly registers: Array<RegisterHandler> = [
        // Pet handlers - call handler directly and emit result
        {
            messageType: GameActionReceiveMessage.BuyPet,
            handler: async (client: Client, data: ReceiveBuyPetPayload) => {
                if (!this.petHandler) {
                    this.logger.error("PetHandler not initialized")
                    return
                }
                const payload: BuyPetPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    petType: data.petType,
                    petTypeId: data.petTypeId,
                    isBuyPet: data.isBuyPet,
                }
                const result = await this.petHandler.handleBuyPet(payload)
                const responsePayload: BuyPetResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePetEvent.BuyResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.EatedFood,
            handler: async (client: Client, data: FoodConsumedPayload) => {
                if (!this.petHandler) {
                    this.logger.error("PetHandler not initialized")
                    return
                }

                const payload: FoodConsumedPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    petId: data.petId,
                    hungerLevel: data.hungerLevel,
                }
                const result = await this.petHandler.handleFoodConsumed(payload)
                const responsePayload: FoodConsumedResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePetEvent.EatedFoodResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.CleanedPet,
            handler: async (client: Client, data: CleanedPetPayload) => {
                if (!this.petHandler) {
                    this.logger.error("PetHandler not initialized")
                    return
                }
                const payload: CleanedPetPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    petId: data.petId,
                    cleaningItemId: data.cleaningItemId,
                    poopId: data.poopId,
                }
                const result = await this.petHandler.handleCleanedPet(payload)
                const responsePayload: CleanedPetResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePetEvent.CleanedResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.PlayedPet,
            handler: async (client: Client, data: PlayedPetPayload) => {
                if (!this.petHandler) {
                    this.logger.error("PetHandler not initialized")
                    return
                }
                const payload: PlayedPetPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    petId: data.petId,
                    happinessLevel: data.happinessLevel,
                }
                const result = await this.petHandler.handlePlayedPet(payload)
                const responsePayload: PlayedPetResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePetEvent.PlayedResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.BuyFood,
            handler: async (client: Client, data: ReceiveBuyFoodPayload) => {
                if (!this.foodHandler) {
                    this.logger.error("FoodHandler not initialized")
                    return
                }
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
                const result = await this.foodHandler.handlePurchaseFood(payload)
                const responsePayload: PurchaseFoodResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GameFoodEvent.PurchaseResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.GetStoreCatalog,
            handler: async (client: Client) => {
                if (!this.foodHandler) {
                    this.logger.error("FoodHandler not initialized")
                    return
                }
                const payload: GetCatalogPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                }
                const result = await this.foodHandler.handleGetCatalog(payload)
                const responsePayload: GetCatalogResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GameFoodEvent.GetCatalogResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.GetFoodInventory,
            handler: async (client: Client) => {
                if (!this.foodHandler) {
                    this.logger.error("FoodHandler not initialized")
                    return
                }
                const payload: GetFoodInventoryPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                }
                const result = await this.foodHandler.handleGetInventory(payload)
                const responsePayload: GetFoodInventoryResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GameFoodEvent.GetInventoryResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.CreatePoop,
            handler: async (client: Client, data: any) => {
                if (!this.petHandler) {
                    this.logger.error("PetHandler not initialized")
                    return
                }
                const payload: CreatePoopPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    petId: data.petId,
                    positionX: data.positionX,
                    positionY: data.positionY,
                }
                const result = await this.petHandler.handleCreatePoop(payload)
                const responsePayload: CreatePoopResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePetEvent.CreatePoopResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.FeedPet,
            handler: async (client: Client, data: ReceiveFeedPetPayload) => {
                if (!this.foodHandler) {
                    this.logger.error("FoodHandler not initialized")
                    return
                }
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
                const result = await this.foodHandler.handleFeedPet(payload)
                const responsePayload: FeedPetWithFoodResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GameFoodEvent.FeedPetResponse, responsePayload)
            },
        },
        // Inventory handlers - call handler directly and emit result
        {
            messageType: GameActionReceiveMessage.PurchaseItem,
            handler: async (client: Client, data: ReceivePurchaseItemPayload) => {
                if (!this.inventoryHandler) {
                    this.logger.error("InventoryHandler not initialized")
                    return
                }
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
                const result = await this.inventoryHandler.handlePurchaseItem(payload)
                const responsePayload: PurchaseInventoryItemResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GameInventoryEvent.PurchaseItemResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.GetInventory,
            handler: async (client: Client) => {
                if (!this.inventoryHandler) {
                    this.logger.error("InventoryHandler not initialized")
                    return
                }
                const payload: GetInventoryPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                }
                const result = await this.inventoryHandler.handleGetInventory(payload)
                const responsePayload: GetInventoryResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GameInventoryEvent.GetInventoryResponse, responsePayload)
            },
        },
        // Player handlers - call handler directly and emit result
        {
            messageType: GameActionReceiveMessage.RequestGameConfig,
            handler: async (client: Client, data: ReceiveRequestGameConfigPayload) => {
                if (!this.playerHandler) {
                    this.logger.error("PlayerHandler not initialized")
                    return
                }
                const payload: GetGameConfigPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    data: data.data,
                }
                const result = await this.playerHandler.handleGetGameConfig(payload)
                const responsePayload: GetGameConfigResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePlayerEvent.GetGameConfigResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.RequestPlayerState,
            handler: async (client: Client, data: ReceiveRequestPlayerStatePayload) => {
                if (!this.playerHandler) {
                    this.logger.error("PlayerHandler not initialized")
                    return
                }
                const payload: GetPlayerStatePayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    data: data.data,
                }
                const result = await this.playerHandler.handleGetPlayerState(payload)
                const responsePayload: GetPlayerStateResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePlayerEvent.GetPlayerStateResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.GetProfile,
            handler: async (client: Client, data: ReceiveGetProfilePayload) => {
                if (!this.playerHandler) {
                    this.logger.error("PlayerHandler not initialized")
                    return
                }
                const payload: GetProfilePayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    data: data.data,
                }
                const result = await this.playerHandler.handleGetProfile(payload)
                const responsePayload: GetProfileResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePlayerEvent.GetProfileResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.RequestPetsState,
            handler: async (client: Client, data: ReceiveRequestPetsStatePayload) => {
                if (!this.playerHandler) {
                    this.logger.error("PlayerHandler not initialized")
                    return
                }
                const payload: GetPetsStatePayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    data: data.data,
                }
                const result = await this.playerHandler.handleGetPetsState(payload)
                const responsePayload: GetPetsStateResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePlayerEvent.GetPetsStateResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.ClaimDailyReward,
            handler: async (client: Client, data: ReceiveClaimDailyRewardPayload) => {
                if (!this.playerHandler) {
                    this.logger.error("PlayerHandler not initialized")
                    return
                }
                const payload: ClaimDailyRewardPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    data: data.data,
                }
                const result = await this.playerHandler.handleClaimDailyReward(payload)
                const responsePayload: ClaimDailyRewardResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePlayerEvent.ClaimDailyRewardResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.UpdateSettings,
            handler: async (client: Client, data: ReceiveUpdateSettingsPayload) => {
                if (!this.playerHandler) {
                    this.logger.error("PlayerHandler not initialized")
                    return
                }
                const payload: UpdateSettingsPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    settings: {
                        name: data.name,
                        preferences: data.preferences,
                    },
                }
                const result = await this.playerHandler.handleUpdateSettings(payload)
                const responsePayload: UpdateSettingsResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePlayerEvent.UpdateSettingsResponse, responsePayload)
            },
        },
        {
            messageType: GameActionReceiveMessage.UpdateTutorial,
            handler: async (client: Client, data: ReceiveUpdateTutorialPayload) => {
                if (!this.playerHandler) {
                    this.logger.error("PlayerHandler not initialized")
                    return
                }
                const payload: UpdateTutorialPayload = {
                    room: this as unknown as GameRoom,
                    client,
                    sessionId: client.sessionId,
                    tutorialData: {
                        step: data.step,
                        completed: data.completed,
                        progress: data.progress,
                    },
                }
                const result = await this.playerHandler.handleUpdateTutorial(payload)
                const responsePayload: UpdateTutorialResponsePayload = {
                    client,
                    sessionId: client.sessionId,
                    result,
                }
                this.eventEmitter.emit(GamePlayerEvent.UpdateTutorialResponse, responsePayload)
            },
        },
    ]

    protected registerReceiverHandlers() {
        this.registers.forEach((register) => {
            this.onMessage(register.messageType, register.handler)
        })
    }
}
