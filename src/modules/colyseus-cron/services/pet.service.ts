import { Injectable, Logger } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { OwnedPetSchema, PetSchema } from "@modules/databases/mongodb/game"
import { PetStatus } from "@modules/databases/mongodb/game/enums"
import { GAME_MONGOOSE_CONNECTION_NAME } from "@modules/databases/mongodb/game/constants"

/**
 * PetService for queue processors
 * Works with OwnedPetSchema from nomas-server
 */
@Injectable()
export class PetService {
    private readonly logger = new Logger(PetService.name)

    constructor(
        @InjectModel(OwnedPetSchema.name, GAME_MONGOOSE_CONNECTION_NAME)
        private ownedPetModel: Model<OwnedPetSchema>,
        @InjectModel(PetSchema.name, GAME_MONGOOSE_CONNECTION_NAME)
        private petModel: Model<PetSchema>,
    ) {}

    /**
     * Find all active pets
     */
    async findActivePets() {
        return this.ownedPetModel
            .find({ status: PetStatus.Active })
            .populate("type")
            .populate("user")
            .exec()
    }

    /**
     * Find young pets (not adult)
     */
    async findPetYoungPets() {
        return this.ownedPetModel.find({ isAdult: false }).populate("type").exec()
    }

    /**
     * Find pets that can generate income
     */
    async findPetPosibleIncome() {
        const pets = await this.ownedPetModel
            .find({ isAdult: true })
            .populate("type")
            .exec()

        return pets.filter((pet) => {
            const petType = pet.type as PetSchema
            if (!petType) return false

            return (
                pet.tokenIncome < petType.maxIncomePerClaim &&
                pet.totalIncome < petType.maxIncome
            )
        })
    }

    /**
     * Update pet stats
     */
    async updateStats(petId: string, petStats: {
        hunger?: number
        happiness?: number
        cleanliness?: number
        lastUpdateHunger?: Date
        lastUpdateHappiness?: Date
        lastUpdateCleanliness?: Date
    }) {
        const updateData: any = {}
        
        if (petStats.hunger !== undefined) updateData.hunger = petStats.hunger
        if (petStats.happiness !== undefined) updateData.happiness = petStats.happiness
        if (petStats.cleanliness !== undefined) updateData.cleanliness = petStats.cleanliness
        if (petStats.lastUpdateHunger !== undefined) updateData.lastUpdateHunger = petStats.lastUpdateHunger
        if (petStats.lastUpdateHappiness !== undefined) updateData.lastUpdateHappiness = petStats.lastUpdateHappiness
        if (petStats.lastUpdateCleanliness !== undefined) updateData.lastUpdateCleanliness = petStats.lastUpdateCleanliness

        return this.ownedPetModel.findByIdAndUpdate(petId, updateData, { new: true }).exec()
    }

    /**
     * Update pet to adult
     */
    async updatePetAdult(petId: string) {
        return this.ownedPetModel
            .findByIdAndUpdate(petId, { isAdult: true, lastClaim: new Date() }, { new: true })
            .exec()
    }
}

