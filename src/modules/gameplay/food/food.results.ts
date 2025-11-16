import { PlayerColyseusSchema } from "@modules/colyseus/schemas"

// Result types for FoodGameService - services return these instead of sending responses
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
        catalog: Record<string, { price: number; nutrition: number; name: string }>
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
