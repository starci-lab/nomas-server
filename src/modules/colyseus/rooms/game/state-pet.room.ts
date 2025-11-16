import { AbstractStateManagementGameRoom } from "./state-management.room"
import { PetColyseusSchema, PlayerColyseusSchema } from "../../schemas"
import { MapSchema } from "@colyseus/schema"
import Decimal from "decimal.js"

/**
 * Pet State Management Room
 * Manages all pet-related state operations (feed, play, clean, create, remove)
 * Logic migrated from blockchain-pet-server: PetService
 */
export abstract class AbstractPetStateGameRoom extends AbstractStateManagementGameRoom {
    // Public wrapper methods to expose protected state management methods
    // These can be called from game services that receive room instance
    /**
     * Feed pet to increase hunger and happiness.
     * Logic migrated from blockchain-pet-server: PetService.feedPet
     * Public method to allow game services to call this
     */
    public feedPetState(pet: PetColyseusSchema, foodValue: number = 25): void {
        this.feedPet(pet, foodValue)
    }

    /**
     * Feed pet to increase hunger and happiness.
     * Logic migrated from blockchain-pet-server: PetService.feedPet
     */
    protected feedPet(pet: PetColyseusSchema, foodValue: number = 25): void {
        // Food restores hunger and makes pet happy
        pet.hunger = Math.min(100, new Decimal(pet.hunger).plus(foodValue).toNumber())
        pet.happiness = Math.min(100, new Decimal(pet.happiness).plus(new Decimal(foodValue).times(0.5)).toNumber())
        pet.lastUpdated = Date.now()

        this.logger.debug(`Pet ${pet.id} fed. Hunger: ${pet.hunger}, Happiness: ${pet.happiness}`)
    }

    /**
     * Play with pet to increase happiness.
     * Logic migrated from blockchain-pet-server: PetService.playWithPet
     * Public method to allow game services to call this
     */
    public playWithPetState(pet: PetColyseusSchema, playValue: number = 20): void {
        this.playWithPet(pet, playValue)
    }

    /**
     * Play with pet to increase happiness.
     * Logic migrated from blockchain-pet-server: PetService.playWithPet
     */
    protected playWithPet(pet: PetColyseusSchema, playValue: number = 20): void {
        pet.happiness = Math.min(100, new Decimal(pet.happiness).plus(playValue).toNumber())
        pet.lastUpdated = Date.now()

        this.logger.debug(`Played with pet ${pet.id}. Happiness: ${pet.happiness}`)
    }

    /**
     * Clean pet to increase cleanliness and happiness.
     * Logic migrated from blockchain-pet-server: PetService.cleanPet
     * Public method to allow game services to call this
     */
    public cleanPetState(pet: PetColyseusSchema, cleanValue: number = 30): void {
        this.cleanPet(pet, cleanValue)
    }

    /**
     * Clean pet to increase cleanliness and happiness.
     * Logic migrated from blockchain-pet-server: PetService.cleanPet
     */
    protected cleanPet(pet: PetColyseusSchema, cleanValue: number = 30): void {
        pet.cleanliness = Math.min(100, new Decimal(pet.cleanliness).plus(cleanValue).toNumber())
        // Cleaning makes pet slightly happy
        pet.happiness = Math.min(100, new Decimal(pet.happiness).plus(new Decimal(cleanValue).times(0.3)).toNumber())
        pet.lastUpdated = Date.now()

        this.logger.debug(`Pet ${pet.id} cleaned. Cleanliness: ${pet.cleanliness}, Happiness: ${pet.happiness}`)
    }

    /**
     * Create a new pet instance.
     * Logic migrated from blockchain-pet-server: PetService.createPet
     * Public method to allow game services to call this
     */
    public createPetState(petId: string, ownerId: string, petType?: string): PetColyseusSchema {
        return this.createPet(petId, ownerId, petType)
    }

    /**
     * Create a new pet instance.
     * Logic migrated from blockchain-pet-server: PetService.createPet
     */
    protected createPet(petId: string, ownerId: string, petType?: string): PetColyseusSchema {
        const pet = new PetColyseusSchema()
        pet.id = petId
        pet.ownerId = ownerId
        pet.petType = petType || "chog"
        pet.hunger = 100
        pet.happiness = 100
        pet.cleanliness = 100
        pet.lastUpdated = Date.now()

        this.logger.debug(`Created pet ${petId} for owner ${ownerId}`)
        return pet
    }

    /**
     * Get pets owned by specific player from player state.
     * Logic migrated from blockchain-pet-server: PetService.getPlayerPets
     */
    protected getPlayerPets(player: PlayerColyseusSchema): PetColyseusSchema[] {
        const playerPets: PetColyseusSchema[] = []
        if (player && player.pets) {
            player.pets.forEach((pet: PetColyseusSchema) => {
                playerPets.push(pet)
            })
        }
        return playerPets
    }

    /**
     * Get pet stats summary.
     * Logic migrated from blockchain-pet-server: PetService.getPetStatsSummary
     * Public method to allow game services to call this
     */
    public getPetStatsSummary(pet: PetColyseusSchema) {
        return {
            id: pet.id,
            petType: pet.petType,
            hunger: Math.round(pet.hunger),
            happiness: Math.round(pet.happiness),
            cleanliness: Math.round(pet.cleanliness),
            overallHealth: Math.round((pet.hunger + pet.happiness + pet.cleanliness) / 3),
            lastUpdated: pet.lastUpdated,
            poops:
                pet.poops?.map((poop) => {
                    return {
                        id: poop.id,
                        petId: poop.petId,
                        positionX: poop.positionX,
                        positionY: poop.positionY,
                    }
                }) || [],
        }
    }

    /**
     * Remove pet from room state and player's pets collection.
     * Logic migrated from blockchain-pet-server: PetService.handleRemovePet
     * Public method - already public
     */
    public removePetFromState(petId: string, player: PlayerColyseusSchema): boolean {
        const pet = this.state.pets.get(petId)
        if (!pet || pet.ownerId !== player.sessionId) {
            this.logger.debug(`Cannot remove pet ${petId} - invalid pet or ownership`)
            return false
        }

        // Remove pet from room state
        this.state.pets.delete(petId)

        // Remove pet from player's pets collection
        if (player.pets) {
            player.pets.delete(petId)
        }

        // Update player's pet count
        player.totalPetsOwned = this.getPlayerPets(player).length

        this.logger.debug(`Pet ${petId} removed for ${player.walletAddress}. Remaining pets: ${player.totalPetsOwned}`)
        return true
    }

    /**
     * Add pet to room state and player's pets collection.
     * Logic migrated from blockchain-pet-server: PetService.handleBuyPet
     * Public method - already public
     */
    public addPetToState(pet: PetColyseusSchema, player: PlayerColyseusSchema): void {
        // Add pet to room state
        this.state.pets.set(pet.id, pet)

        // Add pet to player's pets collection
        if (!player.pets) {
            // Initialize pets map if not exists
            player.pets = new MapSchema<PetColyseusSchema>()
        }
        player.pets.set(pet.id, pet)

        // Update player's pet count
        player.totalPetsOwned = this.getPlayerPets(player).length

        this.logger.debug(
            `Pet ${pet.id} added to state for ${player.walletAddress}. Total pets: ${player.totalPetsOwned}`,
        )
    }
}
