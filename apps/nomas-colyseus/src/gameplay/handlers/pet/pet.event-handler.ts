import { Injectable, Logger } from "@nestjs/common"
import { PetGameService } from "@modules/gameplay/pet/pet.service"
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

@Injectable()
export class PetEventHandler {
    private readonly logger = new Logger(PetEventHandler.name)
    constructor(private readonly petGameService: PetGameService) {}

    async handleBuyPet(payload: BuyPetPayload) {
        try {
            await this.petGameService.handleBuyPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle buy pet: ${error.message}`, error.stack)
            throw error
        }
    }

    async handleRemovePet(payload: RemovePetPayload) {
        try {
            await this.petGameService.handleRemovePet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle remove pet: ${error.message}`, error.stack)
            throw error
        }
    }

    async handleFeedPet(payload: FeedPetPayload) {
        try {
            await this.petGameService.handleFeedPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            throw error
        }
    }

    async handlePlayPet(payload: PlayPetPayload) {
        try {
            await this.petGameService.handlePlayPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle play pet: ${error.message}`, error.stack)
            throw error
        }
    }

    async handleCleanPet(payload: DirectCleanPetPayload) {
        try {
            await this.petGameService.handleCleanPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle clean pet: ${error.message}`, error.stack)
            throw error
        }
    }

    async handleFoodConsumed(payload: FoodConsumedPayload) {
        try {
            await this.petGameService.handleFoodConsumed(payload)
        } catch (error) {
            this.logger.error(`Failed to handle food consumed: ${error.message}`, error.stack)
            throw error
        }
    }

    async handleCleanedPet(payload: CleanedPetPayload) {
        try {
            await this.petGameService.handleCleanedPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle cleaned pet: ${error.message}`, error.stack)
            throw error
        }
    }

    async handlePlayedPet(payload: PlayedPetPayload) {
        try {
            await this.petGameService.handlePlayedPet(payload)
        } catch (error) {
            this.logger.error(`Failed to handle played pet: ${error.message}`, error.stack)
            throw error
        }
    }

    async handleCreatePoop(payload: CreatePoopPayload) {
        try {
            await this.petGameService.handleCreatePoop(payload)
        } catch (error) {
            this.logger.error(`Failed to handle create poop: ${error.message}`, error.stack)
            throw error
        }
    }
}
