import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { PetGameService } from "@modules/gameplay"
import { GamePetEvent } from "@modules/game/pet/pet.events"
import {
    BuyPetPayload,
    RemovePetPayload,
    FeedPetPayload,
    PlayPetPayload,
    DirectCleanPetPayload,
    FoodConsumedPayload,
    CleanedPetPayload,
    PlayedPetPayload,
    CreatePoopPayload,
} from "@modules/game/pet/pet.events"

/**
 * Pet Event Handler - Business logic handler that listens to GamePetEvent.* events
 * This handler directly listens to events emitted from Colyseus rooms and executes business logic
 *
 * Flow: Room emits event → This handler listens (@OnEvent) → Executes business logic
 */
@Injectable()
export class PetEventHandler {
    private readonly logger = new Logger(PetEventHandler.name)
    constructor(private readonly petGameService: PetGameService) {}

    // Event listeners - directly listen to events emitted from rooms
    @OnEvent(GamePetEvent.BuyRequested)
    async onBuyPet(payload: BuyPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.BuyRequested}`)
        try {
            await this.petGameService.handleBuyPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle buy pet: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.RemoveRequested)
    async onRemovePet(payload: RemovePetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.RemoveRequested}`)
        try {
            await this.petGameService.handleRemovePet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle remove pet: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.FeedRequested)
    async onFeedPet(payload: FeedPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.FeedRequested}`)
        try {
            await this.petGameService.handleFeedPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.PlayRequested)
    async onPlayPet(payload: PlayPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.PlayRequested}`)
        try {
            await this.petGameService.handlePlayPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle play pet: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.CleanRequested)
    async onCleanPet(payload: DirectCleanPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.CleanRequested}`)
        try {
            await this.petGameService.handleCleanPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle clean pet: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.FoodConsumed)
    async onFoodConsumed(payload: FoodConsumedPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.FoodConsumed}`)
        try {
            await this.petGameService.handleFoodConsumed(payload)
        } catch (error) {
            this.logger.error(`Failed to handle food consumed: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.Cleaned)
    async onCleanedPet(payload: CleanedPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.Cleaned}`)
        try {
            await this.petGameService.handleCleanedPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle cleaned pet: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.Played)
    async onPlayedPet(payload: PlayedPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.Played}`)
        try {
            await this.petGameService.handlePlayedPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle played pet: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePetEvent.PoopCreated)
    async onPoopCreated(payload: CreatePoopPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.PoopCreated}`)
        try {
            await this.petGameService.handleCreatePoop(payload)
        } catch (error) {
            this.logger.error(`Failed to handle create poop: ${error.message}`, error.stack)
            throw error
        }
    }
}
