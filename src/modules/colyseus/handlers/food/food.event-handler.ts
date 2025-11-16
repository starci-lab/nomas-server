import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { Client } from "colyseus"
import { FoodGameService, GameFoodEvent } from "@modules/gameplay"
import { PurchaseFoodPayload, GetCatalogPayload, GetInventoryPayload, FeedPetWithFoodPayload } from "@modules/gameplay"
import {
    SendPurchaseResponsePayload,
    SendStoreCatalogPayload,
    SendFoodInventoryPayload,
    SendFeedResultPayload,
} from "@modules/colyseus/events"
import { DayjsService } from "@modules/mixin"

// Type for sender room methods
type SenderRoom = {
    sendPurchaseResponse: (client: Client, payload: SendPurchaseResponsePayload) => void
    sendStoreCatalog: (client: Client, payload: SendStoreCatalogPayload) => void
    sendFoodInventory: (client: Client, payload: SendFoodInventoryPayload) => void
    sendFeedResult: (client: Client, payload: SendFeedResultPayload) => void
}

/**
 * Food Event Handler - Refactored to use sender.room.ts
 * Flow: Room emits event → This handler listens → Calls service → Service returns result → Handler calls sender.room.ts
 */
@Injectable()
export class FoodEventHandler {
    private readonly logger = new Logger(FoodEventHandler.name)
    constructor(
        private readonly foodGameService: FoodGameService,
        private readonly dayjsService: DayjsService,
    ) {}

    @OnEvent(GameFoodEvent.PurchaseRequested)
    async onPurchaseFood(payload: PurchaseFoodPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.PurchaseRequested}`)
        try {
            const result = await this.foodGameService.handlePurchaseItem(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendPurchaseResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle purchase food: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendPurchaseResponse(payload.client, {
                success: false,
                message: "Failed to purchase food",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GameFoodEvent.GetCatalogRequested)
    async onGetCatalog(payload: GetCatalogPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.GetCatalogRequested}`)
        try {
            const result = await this.foodGameService.handleGetCatalog(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendStoreCatalog(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle get catalog: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendStoreCatalog(payload.client, {
                success: false,
                error: "Failed to get store catalog",
                timestamp: this.dayjsService.now().unix(),
            })
        }
    }

    @OnEvent(GameFoodEvent.GetInventoryRequested)
    async onGetInventory(payload: GetInventoryPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.GetInventoryRequested}`)
        try {
            const result = await this.foodGameService.handleGetInventory(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendFoodInventory(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle get inventory: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendFoodInventory(payload.client, {
                success: false,
                error: "Failed to get inventory",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GameFoodEvent.FeedPetRequested)
    async onFeedPet(payload: FeedPetWithFoodPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.FeedPetRequested}`)
        try {
            const result = await this.foodGameService.handleFeedPet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendFeedResult(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendFeedResult(payload.client, {
                success: false,
                error: error instanceof Error ? error.message : "Failed to feed pet",
                timestamp: Date.now(),
            })
        }
    }
}
