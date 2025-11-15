import { GameRoomColyseusSchema, PetColyseusSchema, PlayerColyseusSchema } from "../../schemas"
import { BaseRoom } from "../base.room"
import Decimal from "decimal.js"
import { GAME_ROOM_UPDATE_INTERVAL } from "./constanst"
// we declare an abstract class for the state management game room
// we only process logic here, no-related actions should be handled here
export abstract class AbstractStateManagementGameRoom extends BaseRoom<GameRoomColyseusSchema> {
    protected lastStatePersistedAt = 0
    /**
     * Handles passive, time-based decay of a pet's core stats.
     * Called every simulation tick to keep the pet lifecycle dynamic.
     */
    protected applyPetDecay(
        pet: PetColyseusSchema
    ) {
        const DECAY_RATE = new Decimal(1)
        pet.hunger = new Decimal(pet.hunger).minus(DECAY_RATE).toNumber()
        pet.happiness = new Decimal(pet.happiness).minus(DECAY_RATE).toNumber()
        pet.cleanliness = new Decimal(pet.cleanliness).minus(DECAY_RATE).toNumber()
        pet.lastUpdated = Date.now()
    }

    // Registers all pets owned by the player into the room's shared state.
    // Ensures that the room can track, update, and broadcast these pets to all clients.
    protected registerPlayerPets(player: PlayerColyseusSchema) {
        if (!player.pets) return

        player.pets.forEach((pet) => {
            this.state.pets.set(pet.id, pet)
        })

        player.totalPetsOwned = player.pets.size
    }

    // Removes all pets from the room state that belong to the disconnected player.
    // Called when a player leaves the room to ensure the global state stays consistent.
    protected removePetsOwnedByPlayer(sessionId: string) {
        const petIdsToRemove: Array<string> = []

        this.state.pets.forEach((pet, petId) => {
            if (pet.ownerId === sessionId) {
                petIdsToRemove.push(petId)
            }
        })

        petIdsToRemove.forEach((petId) => {
            this.state.pets.delete(petId)
        })
    }


    /**
    * Executes a single simulation tick of the game loop.
    * Updates all time-based entity states (eg. pet decay) and performs
    * periodic background tasks such as state persistence.
    */
    protected runSimulationTick() {
        this.state.players.forEach((player) => {
            player.pets?.forEach((pet) => this.applyPetDecay(pet))
        })

        const now = this.dayjsService.now().valueOf()
        if (now - this.lastStatePersistedAt >= 60_000) {
            this.lastStatePersistedAt = now
            this.logger.debug("💾 State snapshot persisted (placeholder)")
        }
    }

    /**
    * Initializes the simulation loop that drives all recurring game updates.
    * Executes one simulation tick at a fixed interval defined by GAME_ROOM_UPDATE_INTERVAL constant.
    */
    protected initializeSimulationLoop() {
        this.setSimulationInterval(() => this.runSimulationTick(), GAME_ROOM_UPDATE_INTERVAL)
        this.logger.debug("⏱️ Simulation loop initialized")
    }
}