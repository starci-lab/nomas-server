import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common"
import { MapSchema } from "@colyseus/schema"
import {
    GameRoomColyseusSchema,
    PetColyseusSchema,
    PlayerColyseusSchema,
    PoopColyseusSchema,
} from "@modules/colyseus/schemas"
import { DEFAULT_PET_PRICE } from "./pet.constants"
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
import {
    BuyPetResult,
    RemovePetResult,
    FeedPetResult,
    PlayPetResult,
    CleanPetResult,
    CleanedPetResult,
    CreatePoopResult,
} from "./pet.results"
import { PlayerGameService } from "../player/player.service"
import { TrackGameAction } from "@modules/prometheus/decorators"

@Injectable()
export class PetGameService {
    private readonly logger = new Logger(PetGameService.name)

    constructor(@Inject(forwardRef(() => PlayerGameService)) private playerService: PlayerGameService) {}

    @TrackGameAction("pet_bought", { labels: ["petType"] })
    async handleBuyPet({ room, sessionId, petType, petTypeId, isBuyPet }: BuyPetPayload): Promise<BuyPetResult> {
        const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
        if (!player) {
            return {
                success: false,
                message: "Player not found in room",
                error: "Player not found in room",
            }
        }

        if (isBuyPet) {
            if (player.tokens < DEFAULT_PET_PRICE) {
                return {
                    success: false,
                    message: "Not enough tokens to buy pet",
                    error: "Not enough tokens to buy pet",
                    player,
                }
            }

            // Deduct tokens from player in state
            player.tokens -= DEFAULT_PET_PRICE

            // Sync tokens to DB immediately (tokens must be synced immediately for data integrity)
            await this.playerService.syncTokensToDB(player).catch((error) => {
                this.logger.error(`Failed to sync tokens to DB: ${error.message}`)
                // Continue even if sync fails - state is already updated
            })
        }

        const petId = `${sessionId}-${Date.now()}`

        // Use state management method from AbstractPetStateGameRoom
        const stateRoom = room as unknown as {
            createPetState: (petId: string, ownerId: string, petType?: string) => PetColyseusSchema
            addPetToState: (pet: PetColyseusSchema, player: PlayerColyseusSchema) => void
        }

        let newPet: PetColyseusSchema
        if (stateRoom.createPetState) {
            newPet = stateRoom.createPetState(petId, player.walletAddress || sessionId, petType)
        } else {
            newPet = this.createPet({
                id: petId,
                ownerId: player.walletAddress || sessionId,
                petType,
            })
        }

        // Use state management method to add pet
        if (stateRoom.addPetToState) {
            stateRoom.addPetToState(newPet, player)
        } else {
            // Fallback
            if (!player.pets) {
                player.pets = new MapSchema<PetColyseusSchema>()
            }
            player.pets.set(newPet.id, newPet)
            room.state.pets.set(newPet.id, newPet)
            player.totalPetsOwned = player.pets.size
        }

        return {
            success: true,
            message: "Pet created successfully",
            data: {
                petId: newPet.id,
                petType: newPet.petType,
                petTypeId,
                tokens: player.tokens,
            },
            player,
            pet: newPet,
        }
    }

    @TrackGameAction("pet_removed")
    async handleRemovePet({ room, sessionId, petId }: RemovePetPayload): Promise<RemovePetResult> {
        const player = this.getPlayer(room.state as GameRoomColyseusSchema, sessionId)
        if (!player) {
            return {
                success: false,
                message: "Player not found in room",
                error: "Player not found in room",
            }
        }

        const pet = room.state.pets.get(petId) as PetColyseusSchema
        if (!pet) {
            return {
                success: false,
                message: "Pet not found",
                error: "Pet not found",
                player,
            }
        }

        // Use state management method from AbstractPetStateGameRoom
        const stateRoom = room as unknown as {
            removePetFromState: (petId: string, player: PlayerColyseusSchema) => boolean
        }

        let removed = false
        if (stateRoom.removePetFromState) {
            removed = stateRoom.removePetFromState(petId, player)
        } else {
            // Fallback
            room.state.pets.delete(petId)
            if (player.pets) {
                player.pets.delete(petId)
            }
            player.totalPetsOwned = player.pets?.size ?? 0
            removed = true
        }

        if (!removed) {
            return {
                success: false,
                message: "Cannot remove pet - invalid ownership",
                error: "Cannot remove pet - invalid ownership",
                player,
            }
        }

        return {
            success: true,
            message: "Pet removed",
            data: {
                petId,
                totalPets: player.totalPetsOwned,
            },
            player,
        }
    }

    @TrackGameAction("pet_fed", { labels: ["foodType"], trackDuration: true })
    async handleFeedPet({ room, sessionId, petId, foodType }: FeedPetPayload): Promise<FeedPetResult> {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            return {
                success: false,
                message: "Cannot feed pet",
                error: "Cannot feed pet",
            }
        }

        // Use state management method from AbstractPetStateGameRoom
        const stateRoom = room as unknown as { feedPetState: (pet: PetColyseusSchema, foodValue?: number) => void }
        if (stateRoom.feedPetState) {
            stateRoom.feedPetState(pet, 25) // Food restores 25 hunger points
        } else {
            // Fallback to direct update if method not available
            pet.hunger = Math.min(100, pet.hunger + 25)
            pet.happiness = Math.min(100, pet.happiness + 12.5)
            pet.lastUpdated = Date.now()
        }

        this.refreshPlayerPetReference(player, pet)

        // Get pet stats summary using state management
        const stateRoomWithStats = room as unknown as {
            getPetStatsSummary: (pet: PetColyseusSchema) => {
                id: string
                petType: string
                hunger: number
                happiness: number
                cleanliness: number
                overallHealth: number
                lastUpdated: number
                poops: Array<{ id: string; petId: string; positionX: number; positionY: number }>
            }
        }

        let petStatsSummary
        if (stateRoomWithStats.getPetStatsSummary) {
            petStatsSummary = stateRoomWithStats.getPetStatsSummary(pet)
        } else {
            petStatsSummary = {
                id: pet.id,
                petType: pet.petType,
                hunger: Math.round(pet.hunger),
                happiness: Math.round(pet.happiness),
                cleanliness: Math.round(pet.cleanliness || 100),
                overallHealth: Math.round((pet.hunger + pet.happiness + (pet.cleanliness || 100)) / 3),
                lastUpdated: pet.lastUpdated,
                poops: pet.poops || [],
            }
        }

        return {
            success: true,
            message: `Fed ${foodType} to your pet`,
            data: {
                petId,
                petStats: petStatsSummary,
            },
            player,
        }
    }

    @TrackGameAction("pet_played", { trackDuration: true })
    async handlePlayPet({ room, sessionId, petId }: PlayPetPayload): Promise<PlayPetResult> {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            return {
                success: false,
                message: "Cannot play with pet",
                error: "Cannot play with pet",
            }
        }

        // Use state management method from AbstractPetStateGameRoom
        const stateRoom = room as unknown as { playWithPetState: (pet: PetColyseusSchema, playValue?: number) => void }
        if (stateRoom.playWithPetState) {
            stateRoom.playWithPetState(pet, 20)
        } else {
            // Fallback
            pet.happiness = Math.min(100, pet.happiness + 20)
            pet.lastUpdated = Date.now()
        }

        this.refreshPlayerPetReference(player, pet)

        // Get pet stats summary using state management
        const stateRoomWithStats = room as unknown as {
            getPetStatsSummary: (pet: PetColyseusSchema) => {
                id: string
                petType: string
                hunger: number
                happiness: number
                cleanliness: number
                overallHealth: number
                lastUpdated: number
                poops: Array<{ id: string; petId: string; positionX: number; positionY: number }>
            }
        }

        const petStatsSummary = stateRoomWithStats.getPetStatsSummary
            ? stateRoomWithStats.getPetStatsSummary(pet)
            : {
                  id: pet.id,
                  petType: pet.petType,
                  hunger: Math.round(pet.hunger),
                  happiness: Math.round(pet.happiness),
                  cleanliness: Math.round(pet.cleanliness || 100),
                  overallHealth: Math.round((pet.hunger + pet.happiness + (pet.cleanliness || 100)) / 3),
                  lastUpdated: pet.lastUpdated,
                  poops: pet.poops || [],
              }

        return {
            success: true,
            message: "Played with pet",
            data: {
                petId,
                petStats: petStatsSummary,
            },
            player,
        }
    }

    @TrackGameAction("pet_cleaned", { trackDuration: true })
    async handleCleanPet({ room, sessionId, petId }: DirectCleanPetPayload): Promise<CleanPetResult> {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            return {
                success: false,
                message: "Cannot clean pet",
                error: "Cannot clean pet",
            }
        }

        // Use state management method from AbstractPetStateGameRoom
        const stateRoom = room as unknown as { cleanPetState: (pet: PetColyseusSchema, cleanValue?: number) => void }
        if (stateRoom.cleanPetState) {
            stateRoom.cleanPetState(pet, 30)
        } else {
            // Fallback
            pet.cleanliness = Math.min(100, pet.cleanliness + 30)
            pet.happiness = Math.min(100, pet.happiness + 9)
            pet.lastUpdated = Date.now()
        }

        this.refreshPlayerPetReference(player, pet)

        // Get pet stats summary using state management
        const stateRoomWithStats = room as unknown as {
            getPetStatsSummary: (pet: PetColyseusSchema) => {
                id: string
                petType: string
                hunger: number
                happiness: number
                cleanliness: number
                overallHealth: number
                lastUpdated: number
                poops: Array<{ id: string; petId: string; positionX: number; positionY: number }>
            }
        }

        const petStatsSummary = stateRoomWithStats.getPetStatsSummary
            ? stateRoomWithStats.getPetStatsSummary(pet)
            : {
                  id: pet.id,
                  petType: pet.petType,
                  hunger: Math.round(pet.hunger),
                  happiness: Math.round(pet.happiness),
                  cleanliness: Math.round(pet.cleanliness || 100),
                  overallHealth: Math.round((pet.hunger + pet.happiness + (pet.cleanliness || 100)) / 3),
                  lastUpdated: pet.lastUpdated,
                  poops: pet.poops || [],
              }

        return {
            success: true,
            message: "Cleaned pet",
            data: {
                petId,
                petStats: petStatsSummary,
            },
            player,
        }
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

    async handleCleanedPet({
        room,
        sessionId,
        petId,
        cleaningItemId,
        poopId,
    }: CleanedPetPayload): Promise<CleanedPetResult> {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            return {
                success: false,
                message: "Cannot clean pet",
                error: "Cannot clean pet",
            }
        }

        pet.cleanliness = Math.min(100, pet.cleanliness + 40)
        pet.happiness = Math.min(100, pet.happiness + 15)
        pet.poops = pet.poops.filter((poop) => poop.id !== poopId)
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)

        return {
            success: true,
            message: "Pet cleaned successfully",
            data: {
                petId,
                cleaningItemId,
                cleanliness: pet.cleanliness,
                happiness: pet.happiness,
                poopId,
            },
            player,
        }
    }

    async handlePlayedPet({ room, sessionId, petId, happinessLevel }: PlayedPetPayload): Promise<PlayPetResult> {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            return {
                success: false,
                message: "Cannot update pet happiness",
                error: "Cannot update pet happiness",
            }
        }

        const happiness = Math.min(100, Math.max(0, happinessLevel))
        pet.happiness = happiness
        pet.lastUpdated = Date.now()

        this.refreshPlayerPetReference(player, pet)

        // Get pet stats summary
        const stateRoomWithStats = room as unknown as {
            getPetStatsSummary: (pet: PetColyseusSchema) => {
                id: string
                petType: string
                hunger: number
                happiness: number
                cleanliness: number
                overallHealth: number
                lastUpdated: number
                poops: Array<{ id: string; petId: string; positionX: number; positionY: number }>
            }
        }

        const petStatsSummary = stateRoomWithStats.getPetStatsSummary
            ? stateRoomWithStats.getPetStatsSummary(pet)
            : {
                  id: pet.id,
                  petType: pet.petType,
                  hunger: Math.round(pet.hunger),
                  happiness: Math.round(pet.happiness),
                  cleanliness: Math.round(pet.cleanliness || 100),
                  overallHealth: Math.round((pet.hunger + pet.happiness + (pet.cleanliness || 100)) / 3),
                  lastUpdated: pet.lastUpdated,
                  poops: pet.poops || [],
              }

        return {
            success: true,
            message: "Pet happiness updated",
            data: {
                petId,
                petStats: petStatsSummary,
            },
            player,
        }
    }

    @TrackGameAction("pet_poop_created")
    async handleCreatePoop({
        room,
        sessionId,
        petId,
        positionX,
        positionY,
    }: CreatePoopPayload): Promise<CreatePoopResult> {
        const { player, pet } = this.getPlayerAndPet(room.state as GameRoomColyseusSchema, sessionId, petId)
        if (!player || !pet) {
            return {
                success: false,
                message: "Cannot create poop",
                error: "Cannot create poop",
            }
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

        return {
            success: true,
            message: "Created poop",
            data: {
                petId,
                poopId,
                positionX,
                positionY,
            },
            player,
        }
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
        // Use state management method from AbstractPetStateGameRoom if available
        // For now, create directly as we don't have room instance here
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

    private mapSchemaToArray(map?: MapSchema<PetColyseusSchema>) {
        if (!map) {
            return []
        }
        const list: PetColyseusSchema[] = []
        map.forEach((item) => list.push(item))
        return list
    }
}
