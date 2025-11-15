import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { FoodGameService, GameFoodEvent } from "@modules/gameplay"
import { PurchaseFoodPayload, GetCatalogPayload, GetInventoryPayload, FeedPetWithFoodPayload } from "@modules/gameplay"

@Injectable()
export class FoodEventHandler {
    private readonly logger = new Logger(FoodEventHandler.name)
    constructor(private readonly foodGameService: FoodGameService) {}

    @OnEvent(GameFoodEvent.PurchaseRequested)
    async onPurchaseFood(payload: PurchaseFoodPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.PurchaseRequested}`)
        try {
            await this.foodGameService.handlePurchaseItem(payload)
        } catch (error) {
            this.logger.error(`Failed to handle purchase food: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GameFoodEvent.GetCatalogRequested)
    async onGetCatalog(payload: GetCatalogPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.GetCatalogRequested}`)
        try {
            await this.foodGameService.handleGetCatalog(payload)
        } catch (error) {
            this.logger.error(`Failed to handle get catalog: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GameFoodEvent.GetInventoryRequested)
    async onGetInventory(payload: GetInventoryPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.GetInventoryRequested}`)
        try {
            await this.foodGameService.handleGetInventory(payload)
        } catch (error) {
            this.logger.error(`Failed to handle get inventory: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GameFoodEvent.FeedPetRequested)
    async onFeedPet(payload: FeedPetWithFoodPayload) {
        this.logger.debug(`Event received: ${GameFoodEvent.FeedPetRequested}`)
        try {
            await this.foodGameService.handleFeedPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            throw error
        }
    }
}
