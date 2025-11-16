import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { Client } from "colyseus"
import { PetGameService, GamePetEvent } from "@modules/gameplay"
import {
    BuyPetPayload,
    RemovePetPayload,
    FeedPetPayload,
    PlayPetPayload,
    DirectCleanPetPayload,
    CleanedPetPayload,
    PlayedPetPayload,
    CreatePoopPayload,
    FoodConsumedPayload,
} from "@modules/gameplay"
import {
    SendBuyPetResponsePayload,
    SendRemovePetResponsePayload,
    SendCleanedPetResponsePayload,
    SendCreatePoopResponsePayload,
    SendActionResponsePayload,
    SendPetsStateSyncPayload,
} from "@modules/colyseus/events"

// Type for sender room methods
type SenderRoom = {
    sendBuyPetResponse: (client: Client, payload: SendBuyPetResponsePayload) => void
    sendRemovePetResponse: (client: Client, payload: SendRemovePetResponsePayload) => void
    sendCleanedPetResponse: (client: Client, payload: SendCleanedPetResponsePayload) => void
    sendCreatePoopResponse: (client: Client, payload: SendCreatePoopResponsePayload) => void
    sendActionResponse: (client: Client, payload: SendActionResponsePayload) => void
    sendPetsStateSync: (client: Client, payload: SendPetsStateSyncPayload) => void
}

/**
 * Pet Event Handler - Refactored to use sender.room.ts
 * Flow: Room emits event → This handler listens → Calls service → Service returns result → Handler calls sender.room.ts
 */
@Injectable()
export class PetEventHandler {
    private readonly logger = new Logger(PetEventHandler.name)
    constructor(private readonly petGameService: PetGameService) {}

    @OnEvent(GamePetEvent.BuyRequested)
    async onBuyPet(payload: BuyPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.BuyRequested}`)
        try {
            const result = await this.petGameService.handleBuyPet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendBuyPetResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle buy pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendBuyPetResponse(payload.client, {
                success: false,
                message: "Failed to buy pet",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePetEvent.RemoveRequested)
    async onRemovePet(payload: RemovePetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.RemoveRequested}`)
        try {
            const result = await this.petGameService.handleRemovePet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendRemovePetResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle remove pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendRemovePetResponse(payload.client, {
                success: false,
                message: "Failed to remove pet",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePetEvent.FeedRequested)
    async onFeedPet(payload: FeedPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.FeedRequested}`)
        try {
            const result = await this.petGameService.handleFeedPet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendActionResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: false,
                message: "Failed to feed pet",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePetEvent.PlayRequested)
    async onPlayPet(payload: PlayPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.PlayRequested}`)
        try {
            const result = await this.petGameService.handlePlayPet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendActionResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle play pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: false,
                message: "Failed to play with pet",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePetEvent.CleanRequested)
    async onCleanPet(payload: DirectCleanPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.CleanRequested}`)
        try {
            const result = await this.petGameService.handleCleanPet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendActionResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle clean pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: false,
                message: "Failed to clean pet",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePetEvent.FoodConsumed)
    async onFoodConsumed(payload: FoodConsumedPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.FoodConsumed}`)
        try {
            await this.petGameService.handleFoodConsumed(payload)
            // FoodConsumed doesn't need response, it's internal state update
        } catch (error) {
            this.logger.error(`Failed to handle food consumed: ${error.message}`, error.stack)
        }
    }

    @OnEvent(GamePetEvent.Cleaned)
    async onCleanedPet(payload: CleanedPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.Cleaned}`)
        try {
            const result = await this.petGameService.handleCleanedPet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendCleanedPetResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle cleaned pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendCleanedPetResponse(payload.client, {
                success: false,
                message: "Failed to clean pet",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePetEvent.Played)
    async onPlayedPet(payload: PlayedPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.Played}`)
        try {
            const result = await this.petGameService.handlePlayedPet(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendActionResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle played pet: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: false,
                message: "Failed to update pet happiness",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePetEvent.PoopCreated)
    async onPoopCreated(payload: CreatePoopPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.PoopCreated}`)
        try {
            const result = await this.petGameService.handleCreatePoop(payload)
            const senderRoom = payload.room as unknown as SenderRoom

            senderRoom.sendCreatePoopResponse(payload.client, {
                success: result.success,
                message: result.message,
                data: result.data,
                error: result.error,
                timestamp: Date.now(),
            })

            if (result.player && result.success) {
                this.sendPetsStateSync(senderRoom, payload.client, result.player)
            }
        } catch (error) {
            this.logger.error(`Failed to handle create poop: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendCreatePoopResponse(payload.client, {
                success: false,
                message: "Failed to create poop",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    private sendPetsStateSync(senderRoom: SenderRoom, client: Client, player: any) {
        const pets = this.mapPetsToArray(player.pets)
        senderRoom.sendPetsStateSync(client, {
            pets: pets.map((pet: any) => ({
                id: pet.id,
                ownerId: pet.ownerId,
                petType: pet.petType,
                hunger: pet.hunger,
                happiness: pet.happiness,
                cleanliness: pet.cleanliness,
                lastUpdated: pet.lastUpdated,
            })),
            timestamp: Date.now(),
        })
    }

    private mapPetsToArray(pets?: Map<string, any>) {
        if (!pets) return []
        const list: any[] = []
        pets.forEach((item: any) => list.push(item))
        return list
    }
}
