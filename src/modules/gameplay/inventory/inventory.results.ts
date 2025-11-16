import { PlayerColyseusSchema } from "@modules/colyseus/schemas"

// Result types for InventoryGameService - services return these instead of sending responses
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
