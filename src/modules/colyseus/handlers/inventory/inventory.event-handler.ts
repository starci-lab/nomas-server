import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { Client } from "colyseus"
import { InventoryGameService, GameInventoryEvent } from "@modules/gameplay"
import { PurchaseInventoryItemPayload, GetInventoryPayload } from "@modules/gameplay"
import { SendPurchaseResponsePayload, SendInventoryResponsePayload } from "@modules/colyseus/events"

// Type for sender room methods
type SenderRoom = {
    sendPurchaseResponse: (client: Client, payload: SendPurchaseResponsePayload) => void
    sendInventoryResponse: (client: Client, payload: SendInventoryResponsePayload) => void
}

/**
 * Inventory Event Handler - Refactored to use sender.room.ts
 * Flow: Room emits event → This handler listens → Calls service → Service returns result → Handler calls sender.room.ts
 */
@Injectable()
export class InventoryEventHandler {
    private readonly logger = new Logger(InventoryEventHandler.name)
    constructor(private readonly inventoryGameService: InventoryGameService) {}

    @OnEvent(GameInventoryEvent.PurchaseItemRequested)
    async onPurchaseItem(payload: PurchaseInventoryItemPayload) {
        this.logger.debug(`Event received: ${GameInventoryEvent.PurchaseItemRequested}`)
        try {
            const result = await this.inventoryGameService.handlePurchaseItem(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendPurchaseResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle purchase item: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendPurchaseResponse(payload.client, {
                success: false,
                message: "Failed to purchase item",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GameInventoryEvent.GetInventoryRequested)
    async onGetInventory(payload: GetInventoryPayload) {
        this.logger.debug(`Event received: ${GameInventoryEvent.GetInventoryRequested}`)
        try {
            const result = await this.inventoryGameService.handleGetInventory(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendInventoryResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                tokens: result.tokens,
                error: result.error,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle get inventory: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendInventoryResponse(payload.client, {
                success: false,
                error: "Failed to get inventory",
                timestamp: Date.now(),
            })
        }
    }
}
