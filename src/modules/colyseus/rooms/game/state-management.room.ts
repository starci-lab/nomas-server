import { GameRoomColyseusSchema, PetColyseusSchema, PlayerColyseusSchema } from "../../schemas"
import { BaseRoom } from "../base.room"
import Decimal from "decimal.js"
import { GAME_ROOM_UPDATE_INTERVAL } from "./constanst"
// we declare an abstract class for the state management game room
// we only process logic here, no-related actions should be handled here
export abstract class AbstractStateManagementGameRoom extends BaseRoom<GameRoomColyseusSchema> {
    protected lastStatePersistedAt = 0
    protected lastPlayerSave = 0

    /**
     * Handles passive, time-based decay of a pet's core stats.
     * Called every simulation tick to keep the pet lifecycle dynamic.
     * Logic migrated from blockchain-pet-server: PetService.updatePlayerPetStats
     */
    protected applyPetDecay(pet: PetColyseusSchema) {
        const now = Date.now()
        const updateInterval = 60000 // 1 minute
        const timeSinceLastUpdate = now - pet.lastUpdated

        if (timeSinceLastUpdate >= updateInterval) {
            const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60)

            // Decay rates per hour (from blockchain-pet-server)
            const hungerDecay = 5 // Lose 5 hunger per hour
            const happinessDecay = 3 // Lose 3 happiness per hour
            const cleanlinessDecay = 2 // Lose 2 cleanliness per hour

            // Apply decay using Decimal for precision
            pet.hunger = Math.max(
                0,
                new Decimal(pet.hunger).minus(new Decimal(hungerDecay).times(hoursElapsed)).toNumber(),
            )
            pet.happiness = Math.max(
                0,
                new Decimal(pet.happiness).minus(new Decimal(happinessDecay).times(hoursElapsed)).toNumber(),
            )
            pet.cleanliness = Math.max(
                0,
                new Decimal(pet.cleanliness).minus(new Decimal(cleanlinessDecay).times(hoursElapsed)).toNumber(),
            )
            pet.lastUpdated = now

            this.logger.debug(
                `📊 Pet ${pet.id} stats updated: hunger=${pet.hunger.toFixed(1)}, happiness=${pet.happiness.toFixed(1)}, cleanliness=${pet.cleanliness.toFixed(1)}`,
            )
        }
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
     * Logic migrated from blockchain-pet-server: GameRoom.updateGameLogic
     */
    protected runSimulationTick() {
        // Update pet stats over time for each player (hunger, happiness, cleanliness decay)
        this.state.players.forEach((player) => {
            player.pets?.forEach((pet) => this.applyPetDecay(pet))
        })

        // Periodically save player data (every 5 minutes)
        const now = this.dayjsService.now().valueOf()
        if (!this.lastPlayerSave || now - this.lastPlayerSave >= 5 * 60 * 1000) {
            this.saveAllPlayerData().catch((error) => {
                this.logger.error("❌ Failed to save player data:", error)
            })
            this.lastPlayerSave = now
        }

        // Periodic state persistence (every 15 minutes)
        // This syncs inventory and other state data to DB
        // Tokens are synced immediately, but inventory items are batched here
        if (now - this.lastStatePersistedAt >= 15 * 60 * 1000) {
            this.lastStatePersistedAt = now
            this.logger.debug("💾 State snapshot persisted (placeholder - will sync inventory to DB)")
        }
    }

    /**
     * Saves all player data to database.
     * Logic migrated from blockchain-pet-server: GameRoom.saveAllPlayerData
     */
    protected async saveAllPlayerData() {
        // This will be implemented by child classes that have access to player service
        // For now, just log the intent
        let savedCount = 0
        this.state.players.forEach(() => {
            savedCount++
        })
        if (savedCount > 0) {
            this.logger.debug(`💾 Auto-save triggered for ${savedCount} players (to be implemented)`)
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
