import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"

export enum GameInventoryEvent {
    PurchaseItemRequested = "game.inventory.purchaseItemRequested",
    GetInventoryRequested = "game.inventory.getInventoryRequested",
}

export interface InventoryEventBasePayload {
    room: GameRoom
    client: Client
    sessionId: string
}

export interface PurchaseInventoryItemPayload extends InventoryEventBasePayload {
    itemId: string
    itemType: string
    quantity: number
}

export interface GetInventoryPayload extends InventoryEventBasePayload {}

export type AnyInventoryEventPayload = PurchaseInventoryItemPayload | GetInventoryPayload
