import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { GamePetEvent } from "@modules/game/pet/pet.events"
import { PetEventHandler as PetEventHandlerLogic } from "../../handlers/pet/pet.event-handler"
import type {
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
    constructor(private readonly handlers: PetEventHandlerLogic) {}

    @OnEvent(GamePetEvent.BuyRequested)
    async onBuyPet(payload: BuyPetPayload) {
        await this.handlers.handleBuyPet(payload)
    }

    @OnEvent(GamePetEvent.RemoveRequested)
    async onRemovePet(payload: RemovePetPayload) {
        await this.handlers.handleRemovePet(payload)
    }

    @OnEvent(GamePetEvent.FeedRequested)
    async onFeedPet(payload: FeedPetPayload) {
        await this.handlers.handleFeedPet(payload)
    }

    @OnEvent(GamePetEvent.PlayRequested)
    async onPlayPet(payload: PlayPetPayload) {
        await this.handlers.handlePlayPet(payload)
    }

    @OnEvent(GamePetEvent.CleanRequested)
    async onCleanPet(payload: DirectCleanPetPayload) {
        await this.handlers.handleCleanPet(payload)
    }

    @OnEvent(GamePetEvent.FoodConsumed)
    async onFoodConsumed(payload: FoodConsumedPayload) {
        await this.handlers.handleFoodConsumed(payload)
    }

    @OnEvent(GamePetEvent.Cleaned)
    async onCleanedPet(payload: CleanedPetPayload) {
        await this.handlers.handleCleanedPet(payload)
    }

    @OnEvent(GamePetEvent.Played)
    async onPlayedPet(payload: PlayedPetPayload) {
        await this.handlers.handlePlayedPet(payload)
    }

    @OnEvent(GamePetEvent.PoopCreated)
    async onPoopCreated(payload: CreatePoopPayload) {
        await this.handlers.handleCreatePoop(payload)
    }
}
