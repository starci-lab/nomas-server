import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { Client } from "colyseus"
import { GamePetEvent } from "@modules/colyseus/events"
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
    SenderRoom,
    StateRoom,
} from "./types"
import {
    GameRoomColyseusSchema,
    PetColyseusSchema,
    PlayerColyseusSchema,
    PoopColyseusSchema,
} from "@modules/colyseus/schemas"
import { MapSchema } from "@colyseus/schema"
import { PlayerGameService } from "@modules/gameplay/player/player.service"
import { DEFAULT_PET_PRICE } from "@modules/gameplay/pet/pet.constants"

/**
 * Pet Event Handler - Business logic layer
 * Handles all pet-related game logic directly without calling gameplay services
 */
@Injectable()
export class PetEventHandler {
    private readonly logger = new Logger(PetEventHandler.name)
    constructor(@Inject(forwardRef(() => PlayerGameService)) private readonly playerService: PlayerGameService) {}

    @OnEvent(GamePetEvent.BuyRequested)
    async onBuyPet(payload: BuyPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.BuyRequested}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendBuyPetResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            if (payload.isBuyPet) {
                if (player.tokens < DEFAULT_PET_PRICE) {
                    const senderRoom = payload.room as unknown as SenderRoom
                    senderRoom.sendBuyPetResponse(payload.client, {
                        success: false,
                        message: "Not enough tokens to buy pet",
                        error: "Not enough tokens to buy pet",
                        timestamp: Date.now(),
                    })
                    return
                }

                // Deduct tokens from player in state
                player.tokens -= DEFAULT_PET_PRICE

                // Sync tokens to DB immediately
                await this.playerService.syncTokensToDB(player).catch((error) => {
                    this.logger.error(`Failed to sync tokens to DB: ${error.message}`)
                })
            }

            const petId = `${payload.sessionId}-${Date.now()}`
            const stateRoom = payload.room as unknown as StateRoom

            // Create pet using state management method
            const newPet = stateRoom.createPetState(petId, player.walletAddress || payload.sessionId, payload.petType)

            // Add pet to state
            stateRoom.addPetToState(newPet, player)

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendBuyPetResponse(payload.client, {
                success: true,
                message: "Pet created successfully",
                data: {
                    petId: newPet.id,
                    petType: newPet.petType,
                    petTypeId: payload.petTypeId,
                    tokens: player.tokens,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendRemovePetResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            const pet = payload.room.state.pets.get(payload.petId) as PetColyseusSchema
            if (!pet) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendRemovePetResponse(payload.client, {
                    success: false,
                    message: "Pet not found",
                    error: "Pet not found",
                    timestamp: Date.now(),
                })
                return
            }

            const stateRoom = payload.room as unknown as StateRoom
            const removed = stateRoom.removePetFromState(payload.petId, player)

            if (!removed) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendRemovePetResponse(payload.client, {
                    success: false,
                    message: "Cannot remove pet - invalid ownership",
                    error: "Cannot remove pet - invalid ownership",
                    timestamp: Date.now(),
                })
                return
            }

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendRemovePetResponse(payload.client, {
                success: true,
                message: "Pet removed",
                data: {
                    petId: payload.petId,
                    totalPets: player.totalPetsOwned,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendActionResponse(payload.client, {
                    success: false,
                    message: "Cannot feed pet",
                    error: "Cannot feed pet",
                    timestamp: Date.now(),
                })
                return
            }

            const stateRoom = payload.room as unknown as StateRoom
            stateRoom.feedPetState(pet, 25) // Food restores 25 hunger points

            this.refreshPlayerPetReference(player, pet)

            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: true,
                message: `Fed ${payload.foodType} to your pet`,
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendActionResponse(payload.client, {
                    success: false,
                    message: "Cannot play with pet",
                    error: "Cannot play with pet",
                    timestamp: Date.now(),
                })
                return
            }

            const stateRoom = payload.room as unknown as StateRoom
            stateRoom.playWithPetState(pet, 20)

            this.refreshPlayerPetReference(player, pet)

            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: true,
                message: "Played with pet",
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendActionResponse(payload.client, {
                    success: false,
                    message: "Cannot clean pet",
                    error: "Cannot clean pet",
                    timestamp: Date.now(),
                })
                return
            }

            const stateRoom = payload.room as unknown as StateRoom
            stateRoom.cleanPetState(pet, 30)

            this.refreshPlayerPetReference(player, pet)

            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: true,
                message: "Cleaned pet",
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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

    @OnEvent(GamePetEvent.Cleaned)
    async onCleanedPet(payload: CleanedPetPayload) {
        this.logger.debug(`Event received: ${GamePetEvent.Cleaned}`)
        try {
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendCleanedPetResponse(payload.client, {
                    success: false,
                    message: "Cannot clean pet",
                    error: "Cannot clean pet",
                    timestamp: Date.now(),
                })
                return
            }

            pet.cleanliness = Math.min(100, pet.cleanliness + 40)
            pet.happiness = Math.min(100, pet.happiness + 15)
            pet.poops = pet.poops.filter((poop) => poop.id !== payload.poopId)
            pet.lastUpdated = Date.now()

            this.refreshPlayerPetReference(player, pet)

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendCleanedPetResponse(payload.client, {
                success: true,
                message: "Pet cleaned successfully",
                data: {
                    petId: payload.petId,
                    cleaningItemId: payload.cleaningItemId,
                    cleanliness: pet.cleanliness,
                    happiness: pet.happiness,
                    poopId: payload.poopId,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendActionResponse(payload.client, {
                    success: false,
                    message: "Cannot update pet happiness",
                    error: "Cannot update pet happiness",
                    timestamp: Date.now(),
                })
                return
            }

            const happiness = Math.min(100, Math.max(0, payload.happinessLevel))
            pet.happiness = happiness
            pet.lastUpdated = Date.now()

            this.refreshPlayerPetReference(player, pet)

            const stateRoom = payload.room as unknown as StateRoom
            const petStatsSummary = stateRoom.getPetStatsSummary(pet)

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendActionResponse(payload.client, {
                success: true,
                message: "Pet happiness updated",
                data: {
                    petId: payload.petId,
                    petStats: petStatsSummary,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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
            const { player, pet } = this.getPlayerAndPet(
                payload.room.state as GameRoomColyseusSchema,
                payload.sessionId,
                payload.petId,
            )
            if (!player || !pet) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendCreatePoopResponse(payload.client, {
                    success: false,
                    message: "Cannot create poop",
                    error: "Cannot create poop",
                    timestamp: Date.now(),
                })
                return
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

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendCreatePoopResponse(payload.client, {
                success: true,
                message: "Created poop",
                data: {
                    petId: payload.petId,
                    poopId,
                    positionX: payload.positionX,
                    positionY: payload.positionY,
                },
                timestamp: Date.now(),
            })

            this.sendPetsStateSync(senderRoom, payload.client, player)
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

    private sendPetsStateSync(senderRoom: SenderRoom, client: Client, player: PlayerColyseusSchema) {
        const pets = this.mapPetsToArray(player.pets)
        senderRoom.sendPetsStateSync(client, {
            pets: pets.map((pet: PetColyseusSchema) => ({
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

    private mapPetsToArray(pets?: MapSchema<PetColyseusSchema> | Map<string, PetColyseusSchema>) {
        if (!pets) return []
        const list: PetColyseusSchema[] = []
        pets.forEach((item: PetColyseusSchema) => list.push(item))
        return list
    }
}
