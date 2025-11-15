import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game"
import type { Pet } from "@modules/colyseus/schemas"

export enum GamePetEvent {
    BuyRequested = "game.pet.buyRequested",
    RemoveRequested = "game.pet.removeRequested",
    FeedRequested = "game.pet.feedRequested",
    PlayRequested = "game.pet.playRequested",
    CleanRequested = "game.pet.cleanRequested",
    FoodConsumed = "game.pet.foodConsumed",
    Cleaned = "game.pet.cleaned",
    Played = "game.pet.played",
    PoopCreated = "game.pet.poopCreated",
}

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

export type AnyPetEventPayload =
    | BuyPetPayload
    | RemovePetPayload
    | FeedPetPayload
    | PlayPetPayload
    | DirectCleanPetPayload
    | FoodConsumedPayload
    | CleanedPetPayload
    | PlayedPetPayload
    | CreatePoopPayload

export interface PetsSyncedPayload {
    pets: Pet[]
}
