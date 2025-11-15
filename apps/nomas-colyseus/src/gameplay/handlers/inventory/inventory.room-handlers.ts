import { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"
import { GameInventoryEvent } from "@modules/gameplay"
import { InventoryMessageHandlers } from "./inventory.message-handlers"

/**
 * Inventory Room Handlers - Registers all inventory-related message handlers to the room
 */
export class InventoryRoomHandlers {
    constructor(
        private room: GameRoom,
        private inventoryMessages: InventoryMessageHandlers,
    ) {}

    register() {
        // Get Inventory
        this.room.onMessage("get_inventory", async (client: Client) => {
            const payload = this.inventoryMessages.getInventory(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GameInventoryEvent.GetInventoryRequested, payload)
            }
        })
    }
}
