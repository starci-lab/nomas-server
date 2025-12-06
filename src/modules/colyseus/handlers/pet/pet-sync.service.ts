import { PetColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { AbstractPetStateGameRoom } from "@modules/colyseus/rooms/game/state-pet.room"
import { InjectGameMongoose, OwnedPetSchema, PetSchema, UserSchema } from "@modules/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Connection, ObjectId } from "mongoose"

@Injectable()
export class PetSyncService {
    private readonly logger = new Logger(PetSyncService.name)
    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    async loadOwnerPetsFromDB(player: PlayerColyseusSchema): Promise<Array<OwnedPetSchema>> {
        try {
            const user = await this.getUserByWallet(player.walletAddress)
            if (!user) {
                this.logger.warn(`User not found with wallet: ${player.walletAddress}`)
                return []
            }

            const pets = await this.connection
                .model<OwnedPetSchema>(OwnedPetSchema.name)
                .find({ user: user._id })
                .populate("type")
                .lean<Array<OwnedPetSchema>>()
                .exec()
            return pets
        } catch (error) {
            this.logger.error(`Failed to load pets from DB: ${error.message}`)
            return []
        }
    }

    /**
     * Sync pets from DB to colyseus state
     * @param player - Player colyseus schema
     * @param stateRoom - Room to add pets to state
     * @returns Promise<number> - Number of pets synced
     */
    async syncPetsStateFromDB(player: PlayerColyseusSchema, stateRoom: AbstractPetStateGameRoom): Promise<Array<OwnedPetSchema>> {
        try {
            const dbPets = await this.loadOwnerPetsFromDB(player)
            this.logger.debug(`Loaded ${dbPets.length} pets from DB for ${player.walletAddress}`)

            if (dbPets.length === 0) {
                return []
            }

            dbPets.forEach((pet) => {
                const petSchema = new PetColyseusSchema()
                petSchema.id = (pet._id as ObjectId).toString()
                petSchema.ownerId = player.sessionId
                petSchema.petType = (pet.type as PetSchema).displayId
                petSchema.lastUpdated = Date.now()
                petSchema.birthTime = new Date(pet.createdAt).toISOString()
                petSchema.hunger = pet.hunger
                petSchema.happiness = pet.happiness
                petSchema.cleanliness = pet.cleanliness
                petSchema.lastUpdateHappiness = (pet.lastUpdateHappiness as Date).toISOString()
                petSchema.lastUpdateHunger = (pet.lastUpdateHunger as Date).toISOString()
                petSchema.lastUpdateCleanliness = (pet.lastUpdateCleanliness as Date).toISOString()
                petSchema.isAdult = pet.isAdult
                petSchema.lastClaim = (pet.lastClaim as Date).toISOString()

                stateRoom.addPetToState(petSchema, player)
            })

            return dbPets
        } catch (error) {
            this.logger.error(
                `Failed to sync pets state from DB: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return []
        }
    }

    async getUserByWallet(wallet: string): Promise<UserSchema | null> {
        try {
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOne({ accountAddress: wallet })
                .lean<UserSchema>()
                .exec()

            if (!user) {
                this.logger.warn(`User not found with wallet: ${wallet}`)
                return null
            }
            return user
        } catch (error) {
            this.logger.error(`Failed to get user by wallet: ${error.message}`)
            return null
        }
    }
}
