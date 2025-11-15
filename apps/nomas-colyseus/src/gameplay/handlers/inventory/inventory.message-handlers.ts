import { Injectable, Logger } from "@nestjs/common"
import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"
import { PurchaseInventoryItemPayload, GetInventoryPayload } from "@modules/gameplay"

interface PurchaseItemMessage {
    itemId?: string
    itemType?: string
    quantity?: number
}

@Injectable()
export class InventoryMessageHandlers {
    private readonly logger = new Logger(InventoryMessageHandlers.name)

    purchaseItem(room: GameRoom) {
        return (client: Client, data: PurchaseItemMessage = {}): PurchaseInventoryItemPayload | null => {
            if (!data.itemId || !data.itemType || !data.quantity) {
                this.logger.warn("purchaseItem invoked without required data", data)
                return null
            }
            return {
                room,
                client,
                sessionId: client.sessionId,
                itemId: data.itemId,
                itemType: data.itemType,
                quantity: data.quantity,
            }
        }
    }

    getInventory(room: GameRoom) {
        return (client: Client): GetInventoryPayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
            }
        }
    }
}
