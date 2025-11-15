import { Injectable, Logger } from "@nestjs/common"
import { MapSchema } from "@colyseus/schema"
import { Client } from "colyseus"
import { GameRoomColyseusSchema, PetColyseusSchema, PlayerColyseusSchema, PoopColyseusSchema } from "@modules/colyseus/schemas"
import { GameActionMessages, GamePetMessages, DEFAULT_PET_PRICE } from "./pet.constants"
import {
    BuyPetPayload,
    CleanedPetPayload,
    CreatePoopPayload,
    DirectCleanPetPayload,
    FeedPetPayload,
    FoodConsumedPayload,
    PlayPetPayload,
    PlayedPetPayload,
    RemovePetPayload,
} from "./pet.events"

type ActionResponsePayload = {
    success: boolean
    message: string
    data?: Record<string, unknown>
}

@Injectable()
export class PetGameService {
    private readonly logger = new Logger(PetGameService.name)

    async handleBuyPet({ room, client, sessionId, petType, petTypeId, isBuyPet }: BuyPetPayload) {
        const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
        if (!player) {
            this.sendActionResponse(client, GameActionMessages.BUY_PET_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        if (isBuyPet) {
            if (player.tokens < DEFAULT_PET_PRICE) {
                this.sendActionResponse(client, GameActionMessages.BUY_PET_RESPONSE, {
                    success: false,
                    message: "Not enough tokens to buy pet",
                })
                return
            }
            player.tokens -= DEFAULT_PET_PRICE
        }

        const petId = `${sessionId}-${Date.now()}`
        const newPet = this.createPet({
            id: petId,
            ownerId: player.walletAddress || sessionId,
            petType,
        })
        if (!player.pets) {
            player.pets = new MapSchema<PetColyseusSchema>()
        }
        player.pets.set(newPet.id, newPet)
        room.state.pets.set(newPet.id, newPet)
        player.totalPetsOwned = player.pets.size

        this.sendActionResponse(client, GameActionMessages.BUY_PET_RESPONSE, {
            success: true,
            message: "Pet created successfully",
            data: {
                petId: newPet.id,
                petType: newPet.petType,
                petTypeId,
                tokens: player.tokens,
            },
        })

        this.sendPetsStateSync(client, player)
    }

    async handleRemovePet({ room, client, sessionId, petId }: RemovePetPayload) {
        const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
        if (!player) {
            return
        }

        const pet = room.state.pets.get(petId) as PetColyseusSchema
        if (!pet) {
            this.sendActionResponse(client, GameActionMessages.REMOVE_PET_RESPONSE, {
                success: false,
                message: "Pet not found",
            })
            return
        }

        room.state.pets.delete(petId)
        if (player.pets) {
            player.pets.delete(petId)
        }
        player.totalPetsOwned = player.pets?.size ?? 0

        this.sendActionResponse(client, GameActionMessages.REMOVE_PET_RESPONSE, {
            success: true,
            message: "Pet removed",
            data: {
                petId,
                totalPets: player.totalPetsOwned,
            },
        })

        this.sendPetsStateSync(client, player)
    }

    async handleFeedPet({ room, client, sessionId, petId, foodType }: FeedPetPayload) {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            this.sendActionResponse(client, GameActionMessages.RESPONSE, {
                success: false,
                message: "Cannot feed pet",
            })
            return
        }

        pet.hunger = Math.min(100, pet.hunger + 25)
        pet.happiness = Math.min(100, pet.happiness + 10)
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)
        this.sendActionResponse(client, GameActionMessages.RESPONSE, {
            success: true,
            message: `Fed ${foodType} to your pet`,
            data: {
                petId,
                hunger: pet.hunger,
                happiness: pet.happiness,
            },
        })

        this.sendPetsStateSync(client, player)
    }

    async handlePlayPet({ room, client, sessionId, petId }: PlayPetPayload) {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            this.sendActionResponse(client, GameActionMessages.RESPONSE, {
                success: false,
                message: "Cannot play with pet",
            })
            return
        }

        pet.happiness = Math.min(100, pet.happiness + 20)
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)
        this.sendActionResponse(client, GameActionMessages.RESPONSE, {
            success: true,
            message: "Played with pet",
            data: {
                petId,
                happiness: pet.happiness,
            },
        })

        this.sendPetsStateSync(client, player)
    }

    async handleCleanPet({ room, client, sessionId, petId }: DirectCleanPetPayload) {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            this.sendActionResponse(client, GameActionMessages.RESPONSE, {
                success: false,
                message: "Cannot clean pet",
            })
            return
        }

        pet.cleanliness = Math.min(100, pet.cleanliness + 30)
        pet.happiness = Math.min(100, pet.happiness + 10)
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)
        this.sendActionResponse(client, GameActionMessages.RESPONSE, {
            success: true,
            message: "Cleaned pet",
            data: {
                petId,
                cleanliness: pet.cleanliness,
            },
        })

        this.sendPetsStateSync(client, player)
    }

    async handleFoodConsumed({ room, sessionId, petId, hungerLevel }: FoodConsumedPayload) {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            return
        }

        const hunger = Math.min(100, Math.max(0, hungerLevel))
        pet.hunger = hunger
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)
    }

    async handleCleanedPet({ room, client, sessionId, petId, cleaningItemId, poopId }: CleanedPetPayload) {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            this.sendActionResponse(client, GameActionMessages.CLEANED_PET_RESPONSE, {
                success: false,
                message: "Cannot clean pet",
            })
            return
        }

        pet.cleanliness = Math.min(100, pet.cleanliness + 40)
        pet.happiness = Math.min(100, pet.happiness + 15)
        pet.poops = pet.poops.filter((poop) => poop.id !== poopId)
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)
        this.sendActionResponse(client, GameActionMessages.CLEANED_PET_RESPONSE, {
            success: true,
            message: "Pet cleaned successfully",
            data: {
                petId,
                cleaningItemId,
                cleanliness: pet.cleanliness,
                happiness: pet.happiness,
                poopId,
            },
        })

        this.sendPetsStateSync(client, player)
    }

    async handlePlayedPet({ room, client, sessionId, petId, happinessLevel }: PlayedPetPayload) {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            this.sendActionResponse(client, GameActionMessages.RESPONSE, {
                success: false,
                message: "Cannot update pet happiness",
            })
            return
        }

        const happiness = Math.min(100, Math.max(0, happinessLevel))
        pet.happiness = happiness
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)
        this.sendActionResponse(client, GameActionMessages.RESPONSE, {
            success: true,
            message: "Pet happiness updated",
            data: {
                petId,
                happiness,
            },
        })

        this.sendPetsStateSync(client, player)
    }

    async handleCreatePoop({ room, client, sessionId, petId, positionX, positionY }: CreatePoopPayload) {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            this.sendActionResponse(client, GameActionMessages.CREATE_POOP_RESPONSE, {
                success: false,
                message: "Cannot create poop",
            })
            return
        }

        const poopId = `${petId}-poop-${Date.now()}`
        const poop = new PoopColyseusSchema()
        poop.id = poopId
        poop.petId = petId
        poop.positionX = positionX
        poop.positionY = positionY

        pet.poops = [...pet.poops, poop]
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)
        this.sendActionResponse(client, GameActionMessages.CREATE_POOP_RESPONSE, {
            success: true,
            message: "Created poop",
            data: {
                petId,
                poopId,
                positionX,
                positionY,
            },
        })

        this.sendPetsStateSync(client, player)
    }

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

    private createPet({ id, ownerId, petType }: { id: string; ownerId: string; petType?: string }) {
        const pet = new PetColyseusSchema()
        pet.id = id
        pet.ownerId = ownerId
        pet.petType = petType ?? "default"
        pet.hunger = 100
        pet.happiness = 100
        pet.cleanliness = 100
        pet.poops = []
        pet.lastUpdated = Date.now()
        return pet
    }

    private refreshPlayerPetReference(player: PlayerColyseusSchema, pet: PetColyseusSchema) {
        if (!player.pets) {
            player.pets = new MapSchema<PetColyseusSchema>()
        }
        player.pets.set(pet.id, pet)
        player.totalPetsOwned = player.pets.size
    }

    private sendPetsStateSync(client: Client, player: PlayerColyseusSchema) {
        const pets = this.mapSchemaToArray(player.pets)
        client.send(GamePetMessages.STATE_SYNC, {
            pets,
        })
    }

    private sendActionResponse(client: Client, messageType: string, payload: ActionResponsePayload) {
        client.send(messageType, {
            success: payload.success,
            message: payload.message,
            data: payload.data ?? {},
            timestamp: Date.now(),
        })
    }

    private mapSchemaToArray(map?: MapSchema<PetColyseusSchema>) {
        if (!map) {
            return []
        }
        const list: PetColyseusSchema[] = []
        map.forEach((item) => list.push(item))
        return list
    }
}
