import { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"
import { GamePetMessages, GamePetEvent } from "@modules/gameplay"
import { PetService } from "./pet.message-handlers"

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

interface FoodConsumedMessage {
    pet_id?: string
    hunger_level?: number
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

/**
 * Pet Room Handlers - Registers all pet-related message handlers to the room
 */
export class PetRoomHandlers {
    constructor(
        private room: GameRoom,
        private petMessages: PetService,
    ) {}

    register() {
        // Buy Pet
        this.room.onMessage(GamePetMessages.BUY_PET, async (client: Client, data: BuyPetMessage = {}) => {
            const payload = this.petMessages.buyPet(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePetEvent.BuyRequested, payload)
            }
        })

        // Remove Pet
        this.room.onMessage(GamePetMessages.REMOVE_PET, async (client: Client, data: RemovePetMessage = {}) => {
            const payload = this.petMessages.removePet(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePetEvent.RemoveRequested, payload)
            }
        })

        // Feed Pet
        this.room.onMessage(GamePetMessages.FEED_PET, async (client: Client, data: FeedPetMessage = {}) => {
            const payload = this.petMessages.feedPet(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePetEvent.FeedRequested, payload)
            }
        })

        // Play With Pet
        this.room.onMessage(GamePetMessages.PLAY_WITH_PET, async (client: Client, data: PlayPetMessage = {}) => {
            const payload = this.petMessages.playWithPet(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePetEvent.PlayRequested, payload)
            }
        })

        // Cleaned Pet
        this.room.onMessage(
            GamePetMessages.CLEANED_PET,
            async (client: Client, data: { petId?: string; cleaningItemId?: string; poopId?: string } = {}) => {
                const payload = this.petMessages.cleanedPet(this.room)(client, data)
                if (payload && this.room.eventEmitterService) {
                    await this.room.eventEmitterService.emit(GamePetEvent.CleanRequested, payload)
                }
            },
        )

        // Played Pet
        this.room.onMessage(GamePetMessages.PLAYED_PET, async (client: Client, data: PlayedPetMessage = {}) => {
            const payload = this.petMessages.playedPet(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePetEvent.Played, payload)
            }
        })

        // Food Consumed
        this.room.onMessage(GamePetMessages.FOOD_CONSUMED, async (client: Client, data: FoodConsumedMessage = {}) => {
            const payload = this.petMessages.foodConsumed(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePetEvent.FoodConsumed, payload)
            }
        })

        // Create Poop
        this.room.onMessage(GamePetMessages.CREATE_POOP, async (client: Client, data: CreatePoopMessage = {}) => {
            const payload = this.petMessages.createPoop(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePetEvent.PoopCreated, payload)
            }
        })
    }
}
