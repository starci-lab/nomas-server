import { Client } from "colyseus"
import { PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { GameRoom } from "@modules/colyseus/rooms/game"

// Base payload types
export interface FoodEventBasePayload {
    room: GameRoom
    client: Client
    sessionId: string
}

export interface PurchaseFoodPayload extends FoodEventBasePayload {
    itemId: string
    itemType: string
    itemName: string
    quantity: number
}

export interface GetCatalogPayload extends FoodEventBasePayload {
    client: Client
}

export interface GetFoodInventoryPayload extends FoodEventBasePayload {
    client: Client
}

export interface FeedPetWithFoodPayload extends FoodEventBasePayload {
    petId: string
    foodType: string
    quantity: number
}

// Response event payloads
export interface FoodResponseBasePayload {
    client: Client
    sessionId: string
}

export interface PurchaseFoodResponsePayload extends FoodResponseBasePayload {
    result: PurchaseFoodResult
}

export interface GetCatalogResponsePayload extends FoodResponseBasePayload {
    result: GetCatalogResult
}

export interface GetFoodInventoryResponsePayload extends FoodResponseBasePayload {
    result: GetFoodInventoryResult
}

export interface FeedPetWithFoodResponsePayload extends FoodResponseBasePayload {
    result: FeedPetWithFoodResult
}

// Result types
export interface PurchaseFoodResult {
    success: boolean
    message: string
    data?: {
        itemType?: string
        itemName?: string
        quantity?: number
        totalCost?: number
        newTokenBalance?: number
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface GetCatalogResult {
    success: boolean
    message: string
    data?: {
        catalog: Record<string, { price: number; nutrition: number; name: string; description?: string }>
    }
    error?: string
}

export interface GetFoodInventoryResult {
    success: boolean
    message: string
    data?: {
        inventory: Record<string, unknown>
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface FeedPetWithFoodResult {
    success: boolean
    message: string
    data?: {
        petId?: string
        foodType?: string
        quantity?: number
        nutrition?: number
        petStats?: {
            id: string
            petType: string
            hunger: number
            happiness: number
            cleanliness: number
            overallHealth: number
            lastUpdated: number
            poops: Array<{ id: string; petId: string; positionX: number; positionY: number }>
        }
        inventory?: Record<string, unknown>
    }
    error?: string
    player?: PlayerColyseusSchema
}

// Re-export StateRoom from pet types (single source of truth)
export type { StateRoom } from "../pet/types"

export interface FoodItems {
    [key: string]: {
        price: number
        nutrition: number
        name: string
    }
}

// Re-export InventorySummary from inventory types
export type { InventorySummary } from "../inventory/types"
