import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { InventoryGameService, GameInventoryEvent } from "@modules/gameplay"
import { PurchaseInventoryItemPayload, GetInventoryPayload } from "@modules/gameplay"

@Injectable()
export class InventoryEventHandler {
    private readonly logger = new Logger(InventoryEventHandler.name)
    constructor(private readonly inventoryGameService: InventoryGameService) {}

    @OnEvent(GameInventoryEvent.PurchaseItemRequested)
    async onPurchaseItem(payload: PurchaseInventoryItemPayload) {
        this.logger.debug(`Event received: ${GameInventoryEvent.PurchaseItemRequested}`)
        try {
            await this.inventoryGameService.handlePurchaseItem(payload)
        } catch (error) {
            this.logger.error(`Failed to handle purchase item: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GameInventoryEvent.GetInventoryRequested)
    async onGetInventory(payload: GetInventoryPayload) {
        this.logger.debug(`Event received: ${GameInventoryEvent.GetInventoryRequested}`)
        try {
            await this.inventoryGameService.handleGetInventory(payload)
        } catch (error) {
            this.logger.error(`Failed to handle get inventory: ${error.message}`, error.stack)
            throw error
        }
    }
}
