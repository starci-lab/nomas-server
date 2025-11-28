import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
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
    StateRoom,
    BuyPetResult,
    RemovePetResult,
    FeedPetResult,
    PlayPetResult,
    CleanPetResult,
    CleanedPetResult,
    CreatePoopResult,
} from "./types"
import {
    GameRoomColyseusSchema,
    PetColyseusSchema,
    PlayerColyseusSchema,
    PoopColyseusSchema,
} from "@modules/colyseus/schemas"
import { MapSchema } from "@colyseus/schema"
import { PlayerSyncService } from "../player/player-sync.service"
import { DEFAULT_PET_PRICE } from "../constants"
import { TrackGameAction } from "@modules/prometheus/decorators"
import { InjectGameMongoose, MemdbStorageService, OwnedPetSchema, PetStatus } from "@modules/databases"
import { Connection, ObjectId } from "mongoose"

/**
 * Pet Handler - Pure business logic layer
 * Handles all pet-related game logic and returns results
 */
@Injectable()
export class PetHandler {
    private readonly logger = new Logger(PetHandler.name)
    constructor(
        @Inject(forwardRef(() => PlayerSyncService)) private readonly playerSyncService: PlayerSyncService,
        private readonly memdbStorageService: MemdbStorageService,
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    @TrackGameAction("pet_bought", { labels: ["petType"] })
    async handleBuyPet(payload: BuyPetPayload): Promise<BuyPetResult> {
        try {
            let newOwnedPet: OwnedPetSchema | null = null
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            if (payload.isBuyPet) {
                if (player.tokens < DEFAULT_PET_PRICE) {
                    return {
                        success: false,
                        message: "Not enough tokens to buy pet",
                        error: "Not enough tokens to buy pet",
                    }
                }

                const pet = this.memdbStorageService.getPets().find((pet) => pet.displayId === payload.petType)
                if (!pet) {
                    return {
                        success: false,
                        message: "Pet not found",
                        error: "Pet not found",
                    }
                }

                newOwnedPet = await this.connection.model<OwnedPetSchema>(OwnedPetSchema.name).create({
                    user: player.walletAddress,
                    type: pet._id,
                    name: pet.name,
                    happiness: pet.defaultHappiness,
                    hunger: pet.defaultHunger,
                    cleanliness: pet.defaultCleanliness,
                    status: PetStatus.Active,
                })
                await newOwnedPet.save()

                player.tokens -= pet.costNom

                await this.playerSyncService.syncTokensToDB(player).catch((error) => {
                    this.logger.error(`Failed to sync tokens to DB: ${error.message}`)
                })
            }

            if (!newOwnedPet) {
                return {
                    success: false,
                    message: "Failed to buy pet",
                    error: "Failed to buy pet",
                }
            }

            const petId = (newOwnedPet._id as ObjectId).toString()
            const stateRoom = payload.room as StateRoom

            // Create pet using state management method
            const newPet = stateRoom.createPetState(petId, player.walletAddress || payload.sessionId, payload.petType)

            // Add pet to state
            stateRoom.addPetToState(newPet, player)

            return {
                success: true,
                message: "Pet created successfully",
                data: {
                    petId: newPet.id,
                    petType: newPet.petType,
                    petTypeId: payload.petTypeId,
                    tokens: player.tokens,
                },
                player,
                pet: newPet,
            }
        } catch (error) {
            this.logger.error(`Failed to handle buy pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to buy pet",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    @TrackGameAction("pet_removed", { labels: ["petId"] })
    async handleRemovePet(payload: RemovePetPayload): Promise<RemovePetResult> {
        this.logger.debug(`Handling remove pet: ${payload.petId}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            const pet = payload.room.state.pets.get(payload.petId) as PetColyseusSchema
            if (!pet) {
                return {
                    success: false,
                    message: "Pet not found",
                    error: "Pet not found",
                }
            }

            const stateRoom = payload.room as unknown as StateRoom
            const removed = stateRoom.removePetFromState(payload.petId, player)

            if (!removed) {
                return {
                    success: false,
                    message: "Cannot remove pet - invalid ownership",
                    error: "Cannot remove pet - invalid ownership",
                }
            }

            return {
                success: true,
                message: "Pet removed",
                data: {
                    petId: payload.petId,
                    totalPets: player.totalPetsOwned,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle remove pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to remove pet",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    @TrackGameAction("pet_fed", { labels: ["foodType"], trackDuration: true })
    async handleFeedPet(payload: FeedPetPayload): Promise<FeedPetResult> {
        this.logger.debug(`Handling feed pet: ${payload.petId}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                return {
                    success: false,
                    message: "Cannot feed pet",
                    error: "Cannot feed pet",
                }
            }

            const stateRoom = payload.room as unknown as StateRoom
            stateRoom.feedPetState(pet, 25) // Food restores 25 hunger points

            this.refreshPlayerPetReference(player, pet)

            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            return {
                success: true,
                message: `Fed ${payload.foodType} to your pet`,
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle feed pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to feed pet",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handlePlayPet(payload: PlayPetPayload): Promise<PlayPetResult> {
        this.logger.debug(`Handling play pet: ${payload.petId}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                return {
                    success: false,
                    message: "Cannot play with pet",
                    error: "Cannot play with pet",
                }
            }

            const stateRoom = payload.room as unknown as StateRoom
            stateRoom.playWithPetState(pet, 20)

            this.refreshPlayerPetReference(player, pet)

            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            return {
                success: true,
                message: "Played with pet",
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle play pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to play with pet",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleCleanPet(payload: DirectCleanPetPayload): Promise<CleanPetResult> {
        this.logger.debug(`Handling clean pet: ${payload.petId}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                return {
                    success: false,
                    message: "Cannot clean pet",
                    error: "Cannot clean pet",
                }
            }

            const stateRoom = payload.room as unknown as StateRoom
            stateRoom.cleanPetState(pet, 30)

            this.refreshPlayerPetReference(player, pet)

            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            return {
                success: true,
                message: "Cleaned pet",
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle clean pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to clean pet",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleFoodConsumed(payload: FoodConsumedPayload): Promise<void> {
        this.logger.debug(`Handling food consumed: ${payload.petId}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                return
            }

            const hunger = Math.min(100, Math.max(0, payload.hungerLevel))
            pet.hunger = hunger
            pet.lastUpdated = Date.now()

            this.refreshPlayerPetReference(player, pet)
        } catch (error) {
            this.logger.error(`Failed to handle food consumed: ${error.message}`, error.stack)
        }
    }

    @TrackGameAction("pet_cleaned", { trackDuration: true })
    async handleCleanedPet(payload: CleanedPetPayload): Promise<CleanedPetResult> {
        this.logger.debug(`Handling cleaned pet: ${payload.petId}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                return {
                    success: false,
                    message: "Cannot clean pet",
                    error: "Cannot clean pet",
                }
            }

            pet.cleanliness = Math.min(100, pet.cleanliness + 40)
            pet.happiness = Math.min(100, pet.happiness + 15)
            pet.poops = pet.poops.filter((poop) => poop.id !== payload.poopId)
            pet.lastUpdated = Date.now()

            this.refreshPlayerPetReference(player, pet)

            return {
                success: true,
                message: "Pet cleaned successfully",
                data: {
                    petId: payload.petId,
                    cleaningItemId: payload.cleaningItemId,
                    cleanliness: pet.cleanliness,
                    happiness: pet.happiness,
                    poopId: payload.poopId,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle cleaned pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to clean pet",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    @TrackGameAction("pet_played", { trackDuration: true })
    async handlePlayedPet(payload: PlayedPetPayload): Promise<PlayPetResult> {
        this.logger.debug(`Handling played pet: ${payload.petId}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                return {
                    success: false,
                    message: "Cannot update pet happiness",
                    error: "Cannot update pet happiness",
                }
            }

            const happiness = Math.min(100, Math.max(0, payload.happinessLevel))
            pet.happiness = happiness
            pet.lastUpdated = Date.now()

            this.refreshPlayerPetReference(player, pet)

            const stateRoom = payload.room as unknown as StateRoom
            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            return {
                success: true,
                message: "Pet happiness updated",
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle played pet: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to update pet happiness",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    @TrackGameAction("pet_poop_created")
    async handleCreatePoop(payload: CreatePoopPayload): Promise<CreatePoopResult> {
        this.logger.debug(`Handling create poop: ${payload.petId}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                return {
                    success: false,
                    message: "Cannot create poop",
                    error: "Cannot create poop",
                }
            }

            const poopId = `${payload.petId}-poop-${Date.now()}`
            const poop = new PoopColyseusSchema()
            poop.id = poopId
            poop.petId = payload.petId
            poop.positionX = payload.positionX
            poop.positionY = payload.positionY

            pet.poops = [...pet.poops, poop]
            pet.lastUpdated = Date.now()

            this.refreshPlayerPetReference(player, pet)

            return {
                success: true,
                message: "Created poop",
                data: {
                    petId: payload.petId,
                    poopId,
                    positionX: payload.positionX,
                    positionY: payload.positionY,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle create poop: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to create poop",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    // Helper methods
    private getPlayer(state: GameRoomColyseusSchema, sessionId: string) {
        return state.players.get(sessionId)
    }

    private getPlayerAndPet(state: GameRoomColyseusSchema, sessionId: string, petId: string) {
        const player = this.getPlayer(state, sessionId)
        if (!player) {
            this.logger.warn(`Player ${sessionId} not found in room`)
            return { player: null, pet: null }
        }
        const pet = state.pets.get(petId) as PetColyseusSchema
        if (!pet) {
            this.logger.warn(`Pet ${petId} not found for player ${sessionId}`)
            return { player, pet: null }
        }
        return { player, pet }
    }

    private refreshPlayerPetReference(player: PlayerColyseusSchema, pet: PetColyseusSchema) {
        if (!player.pets) {
            player.pets = new MapSchema<PetColyseusSchema>()
        }
        player.pets.set(pet.id, pet)
        player.totalPetsOwned = player.pets.size
    }

    private mapPetsToArray(pets?: MapSchema<PetColyseusSchema> | Map<string, PetColyseusSchema>) {
        if (!pets) return []
        const list: PetColyseusSchema[] = []
        pets.forEach((item: PetColyseusSchema) => list.push(item))
        return list
    }
}
