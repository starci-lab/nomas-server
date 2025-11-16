import { Client } from "colyseus"
import { PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { GameRoom } from "@modules/colyseus/rooms/game"

// Base payload types
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

export type GetInventoryPayload = InventoryEventBasePayload

// Response event payloads
export interface InventoryResponseBasePayload {
    client: Client
    sessionId: string
}

export interface PurchaseInventoryItemResponsePayload extends InventoryResponseBasePayload {
    result: PurchaseInventoryItemResult
}

export interface GetInventoryResponsePayload extends InventoryResponseBasePayload {
    result: GetInventoryResult
}

// Result types
export interface PurchaseInventoryItemResult {
    success: boolean
    message: string
    data?: {
        itemId?: string
        itemType?: string
        quantity?: number
        newTokenBalance?: number
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface GetInventoryResult {
    success: boolean
    message: string
    data?: {
        inventory: Record<string, unknown>
    }
    tokens?: number
    error?: string
    player?: PlayerColyseusSchema
}

export interface InventorySummary {
    totalItems: number
    itemsByType: Record<string, number>
    items: Array<{
        type: string
        id: string
        name: string
        quantity: number
        totalPurchased: number
    }>
}
