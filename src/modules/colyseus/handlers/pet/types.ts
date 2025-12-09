import { Client } from "colyseus"
import { PetColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { GameRoom } from "@modules/colyseus/rooms/game"
import {
    SendBuyPetResponsePayload,
    SendRemovePetResponsePayload,
    SendCleanedPetResponsePayload,
    SendCreatePoopResponsePayload,
    SendActionResponsePayload,
    SendPetsStateSyncPayload,
} from "@modules/colyseus/events"

// Base payload types
export interface PetEventBasePayload {
    room: GameRoom
    client: Client
    sessionId: string
}

export interface BuyPetPayload extends PetEventBasePayload {
    petType?: string
    petTypeId?: string
    isBuyPet?: boolean
}

export interface RemovePetPayload extends PetEventBasePayload {
    petId: string
}

export interface FeedPetPayload extends PetEventBasePayload {
    petId: string
    foodType: string
}

export interface PlayPetPayload extends PetEventBasePayload {
    petId: string
}

export interface DirectCleanPetPayload extends PetEventBasePayload {
    petId: string
}

export interface FoodConsumedPayload extends PetEventBasePayload {
    petId: string
    hungerLevel: number
}

export interface CleanedPetPayload extends PetEventBasePayload {
    petId: string
    cleaningItemId: string
    poopId: string
}

export interface PlayedPetPayload extends PetEventBasePayload {
    petId: string
    happinessLevel: number
}

export interface CreatePoopPayload extends PetEventBasePayload {
    petId: string
    positionX: number
    positionY: number
}

// Result types
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
        cleanlinessRestored?: number
        cost?: number
        remainingTokens?: number
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

export interface FoodConsumedResult {
    success: boolean
    message: string
    data?: {
        petId?: string
        hungerLevel?: number
    }
    error?: string
    player?: PlayerColyseusSchema
}

export interface PlayedPetResult {
    success: boolean
    message: string
    data?: {
        petId?: string
        happinessLevel?: number
    }
    error?: string
    player?: PlayerColyseusSchema
}

// Type for sender room methods
export type SenderRoom = {
    sendBuyPetResponse: (client: Client, payload: SendBuyPetResponsePayload) => void
    sendRemovePetResponse: (client: Client, payload: SendRemovePetResponsePayload) => void
    sendCleanedPetResponse: (client: Client, payload: SendCleanedPetResponsePayload) => void
    sendCreatePoopResponse: (client: Client, payload: SendCreatePoopResponsePayload) => void
    sendActionResponse: (client: Client, payload: SendActionResponsePayload) => void
    sendPetsStateSync: (client: Client, payload: SendPetsStateSyncPayload) => void
}

// Type for state room methods
export type StateRoom = {
    createPetState: (petId: string, ownerId: string, petType?: string) => PetColyseusSchema
    addPetToState: (pet: PetColyseusSchema, player: PlayerColyseusSchema) => void
    removePetFromState: (petId: string, player: PlayerColyseusSchema) => boolean
    feedPetState: (pet: PetColyseusSchema, foodValue?: number) => void
    playWithPetState: (pet: PetColyseusSchema, playValue?: number) => void
    cleanPetState: (pet: PetColyseusSchema, cleanValue?: number) => void
    getPetStatsSummary: (pet: PetColyseusSchema) => {
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

// Response payload types for event system
export interface BuyPetResponsePayload {
    client: Client
    sessionId: string
    result: BuyPetResult
}

export interface RemovePetResponsePayload {
    client: Client
    sessionId: string
    result: RemovePetResult
}

export interface FeedPetResponsePayload {
    client: Client
    sessionId: string
    result: FeedPetResult
}

export interface PlayPetResponsePayload {
    client: Client
    sessionId: string
    result: PlayPetResult
}

export interface CleanPetResponsePayload {
    client: Client
    sessionId: string
    result: CleanPetResult
}

export interface CleanedPetResponsePayload {
    client: Client
    sessionId: string
    result: CleanedPetResult
}

export interface CreatePoopResponsePayload {
    client: Client
    sessionId: string
    result: CreatePoopResult
}

export interface FoodConsumedResponsePayload {
    client: Client
    sessionId: string
    result: FoodConsumedResult | undefined
}

export interface PlayedPetResponsePayload {
    client: Client
    sessionId: string
    result: PlayedPetResult
}
