import { PetColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"

// Result types for PetGameService - services return these instead of sending responses
export interface BuyPetResult {
    success: boolean
    message: string
    data?: {
        petId?: string
        petType?: string
        petTypeId?: string
        tokens?: number
    }
    error?: string
    player?: PlayerColyseusSchema
    pet?: PetColyseusSchema
}

export interface RemovePetResult {
    success: boolean
    message: string
    data?: {
        petId?: string
        totalPets?: number
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface FeedPetResult {
    success: boolean
    message: string
    data?: {
        petId?: string
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
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface PlayPetResult {
    success: boolean
    message: string
    data?: {
        petId?: string
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
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface CleanPetResult {
    success: boolean
    message: string
    data?: {
        petId?: string
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
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface CleanedPetResult {
    success: boolean
    message: string
    data?: {
        petId?: string
        cleaningItemId?: string
        cleanliness?: number
        happiness?: number
        poopId?: string
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface CreatePoopResult {
    success: boolean
    message: string
    data?: {
        petId?: string
        poopId?: string
        positionX?: number
        positionY?: number
    }
    error?: string
    player?: PlayerColyseusSchema
}
