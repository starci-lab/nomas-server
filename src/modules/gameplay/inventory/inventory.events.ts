import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game"

export enum GameInventoryEvent {
    PurchaseItemRequested = "game.inventory.purchaseItemRequested",
    GetInventoryRequested = "game.inventory.getInventoryRequested",
    PurchaseItemResponse = "game.inventory.purchaseItemResponse",
    GetInventoryResponse = "game.inventory.getInventoryResponse",
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

// Response event payloads
export interface InventoryResponseBasePayload {
    client: Client
    sessionId: string
}

export interface PurchaseInventoryItemResponsePayload extends InventoryResponseBasePayload {
    result: import("./inventory.results").PurchaseInventoryItemResult
}

export interface GetInventoryResponsePayload extends InventoryResponseBasePayload {
    result: import("./inventory.results").GetInventoryResult
}

export type AnyInventoryEventPayload = PurchaseInventoryItemPayload | GetInventoryPayload
