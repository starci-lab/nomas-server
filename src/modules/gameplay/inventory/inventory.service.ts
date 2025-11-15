import { Injectable, Logger } from "@nestjs/common"
import { Client } from "colyseus"
import { GameRoomState, Player } from "@modules/colyseus/schemas"
import { PurchaseInventoryItemPayload, GetInventoryPayload } from "./inventory.events"

type ActionResponsePayload = {
    success: boolean
    message: string
    data?: Record<string, unknown>
}

@Injectable()
export class InventoryGameService {
    private readonly logger = new Logger(InventoryGameService.name)

    async handlePurchaseItem({ room, client, sessionId, itemId, itemType, quantity }: PurchaseInventoryItemPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, "purchase_response", {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement purchase item logic
        this.logger.warn("handlePurchaseItem not yet implemented")
        this.sendActionResponse(client, "purchase_response", {
            success: true,
            message: "Purchase item (placeholder)",
            data: { itemId, itemType, quantity },
        })
    }

    async handleGetInventory({ room, client, sessionId }: GetInventoryPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, "inventory_response", {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement get inventory logic
        this.logger.warn("handleGetInventory not yet implemented")
        const inventorySummary = {
            totalItems: 0,
            itemsByType: {},
            items: [],
        }
        client.send("inventory_response", {
            success: true,
            inventory: inventorySummary,
            tokens: player.tokens,
        })
    }

    private getPlayer(state: GameRoomState, sessionId: string) {
        return state.players.get(sessionId)
    }

    private sendActionResponse(client: Client, messageType: string, payload: ActionResponsePayload) {
        client.send(messageType, {
            success: payload.success,
            message: payload.message,
            data: payload.data ?? {},
            timestamp: Date.now(),
        })
    }
}
