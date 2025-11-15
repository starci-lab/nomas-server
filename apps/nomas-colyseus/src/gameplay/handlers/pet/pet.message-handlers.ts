import { Injectable, Logger } from "@nestjs/common"
import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"
import {
    CreatePoopPayload,
    FoodConsumedPayload,
    PlayPetPayload,
    BuyPetPayload,
    RemovePetPayload,
    FeedPetPayload,
    DirectCleanPetPayload,
    CleanedPetPayload,
    PlayedPetPayload,
} from "@modules/game/pet/pet.events"

interface BuyPetMessage {
    petType?: string
    petTypeId?: string
    isBuyPet?: boolean
}

interface RemovePetMessage {
    petId?: string
}

interface FeedPetMessage {
    petId?: string
    foodType?: string
}

interface PlayPetMessage {
    petId?: string
}

interface CleanPetMessage {
    petId?: string
}

interface FoodConsumedMessage {
    pet_id?: string
    hunger_level?: number
}

interface CleanedPetMessage {
    petId?: string
    cleaningItemId?: string
    poopId?: string
}

interface PlayedPetMessage {
    pet_id?: string
    happiness_level?: number
}

interface CreatePoopMessage {
    petId?: string
    positionX?: number
    positionY?: number
}

@Injectable()
export class PetService {
    private readonly logger = new Logger(PetService.name)

    buyPet(room: GameRoom) {
        return (client: Client, data: BuyPetMessage = {}): BuyPetPayload | null => {
            const payload: BuyPetPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petType: data.petType,
                petTypeId: data.petTypeId,
                isBuyPet: data.isBuyPet,
            }
            return payload
        }
    }

    removePet(room: GameRoom) {
        return (client: Client, data: RemovePetMessage = {}): RemovePetPayload | null => {
            if (!data.petId) {
                this.logger.warn("removePet invoked without petId")
                return null
            }
            const payload: RemovePetPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.petId,
            }
            return payload
        }
    }

    feedPet(room: GameRoom) {
        return (client: Client, data: FeedPetMessage = {}): FeedPetPayload | null => {
            if (!data.petId || !data.foodType) {
                this.logger.warn("feedPet invoked without required data", data)
                return null
            }
            const payload: FeedPetPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.petId,
                foodType: data.foodType,
            }
            return payload
        }
    }

    playWithPet(room: GameRoom) {
        return (client: Client, data: PlayPetMessage = {}): PlayPetPayload | null => {
            if (!data.petId) {
                this.logger.warn("playWithPet invoked without petId")
                return null
            }
            const payload: PlayPetPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.petId,
            }
            return payload
        }
    }

    cleanPet(room: GameRoom) {
        return (client: Client, data: CleanPetMessage = {}): DirectCleanPetPayload | null => {
            if (!data.petId) {
                this.logger.warn("cleanPet invoked without petId")
                return null
            }
            const payload: DirectCleanPetPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.petId,
            }
            return payload
        }
    }

    foodConsumed(room: GameRoom) {
        return (client: Client, data: FoodConsumedMessage = {}): FoodConsumedPayload | null => {
            if (!data.pet_id || typeof data.hunger_level !== "number") {
                this.logger.warn("foodConsumed invoked without pet_id/hunger_level", data)
                return null
            }
            const payload: FoodConsumedPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.pet_id,
                hungerLevel: data.hunger_level,
            }
            return payload
        }
    }

    cleanedPet(room: GameRoom) {
        return (client: Client, data: CleanedPetMessage = {}): CleanedPetPayload | null => {
            if (!data.petId || !data.cleaningItemId || !data.poopId) {
                this.logger.warn("cleanedPet invoked without required data", data)
                return null
            }
            const payload: CleanedPetPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.petId,
                cleaningItemId: data.cleaningItemId,
                poopId: data.poopId,
            }
            return payload
        }
    }

    playedPet(room: GameRoom) {
        return (client: Client, data: PlayedPetMessage = {}): PlayedPetPayload | null => {
            if (!data.pet_id || typeof data.happiness_level !== "number") {
                this.logger.warn("playedPet invoked without pet_id/happiness_level", data)
                return null
            }
            const payload: PlayedPetPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.pet_id,
                happinessLevel: data.happiness_level,
            }
            return payload
        }
    }

    createPoop(room: GameRoom) {
        return (client: Client, data: CreatePoopMessage = {}): CreatePoopPayload | null => {
            if (!data.petId) {
                this.logger.warn("createPoop invoked without petId")
                return null
            }
            const payload: CreatePoopPayload = {
                room,
                client,
                sessionId: client.sessionId,
                petId: data.petId,
                positionX: data.positionX ?? 0,
                positionY: data.positionY ?? 0,
            }
            return payload
        }
    }
}

// Alias for backward compatibility
export const PetMessageHandlers = PetService
