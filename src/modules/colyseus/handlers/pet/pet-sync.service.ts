import { PetColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { AbstractPetStateGameRoom } from "@modules/colyseus/rooms/game/state-pet.room"
import {
    InjectGameMongoose,
    MemdbStorageService,
    OwnedPetSchema,
    PetSchema,
    PetStatus,
    UserSchema,
} from "@modules/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Connection, ObjectId } from "mongoose"

export interface BuyPetData {
    petId: ObjectId
    name: string
    defaultHappiness: number
    defaultHunger: number
    defaultCleanliness: number
    costNom: number
}

@Injectable()
export class PetSyncService {
    private readonly logger = new Logger(PetSyncService.name)
    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
        private readonly memdbStorageService: MemdbStorageService,
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
    async syncPetsStateFromDB(
        player: PlayerColyseusSchema,
        stateRoom: AbstractPetStateGameRoom,
    ): Promise<Array<OwnedPetSchema>> {
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

    /**
     * Buy pet with transaction - ensures atomicity
     * If any step fails, all changes are rolled back
     * @param player - Player colyseus schema
     * @param petType - Pet type displayId from client payload
     * @returns Promise<{ pet: OwnedPetSchema; newTokenBalance: number } | null>
     */
    async buyPetWithTransaction(
        player: PlayerColyseusSchema,
        petType: string,
    ): Promise<{ pet: OwnedPetSchema; newTokenBalance: number } | null> {
        // 1. Get pet data from memory storage
        const petData = this.memdbStorageService.getPets().find((p) => p.displayId === petType)
        if (!petData) {
            this.logger.error(`Pet type not found: ${petType}`)
            return null
        }

        const session = await this.connection.startSession()

        try {
            session.startTransaction()

            // 2. Get user from DB (with session for transaction)
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOne({ accountAddress: player.walletAddress })
                .session(session)
                .exec()

            if (!user) {
                throw new Error(`User not found: ${player.walletAddress}`)
            }

            // 3. Check tokens from DB (not from in-memory state)
            if (user.tokenNom < petData.costNom) {
                throw new Error(`Not enough tokens. Required: ${petData.costNom}, Available: ${user.tokenNom}`)
            }

            // 4. Create owned pet
            const [newOwnedPet] = await this.connection.model<OwnedPetSchema>(OwnedPetSchema.name).create(
                [
                    {
                        user: user._id,
                        type: petData._id,
                        name: petData.name,
                        happiness: petData.defaultHappiness,
                        hunger: petData.defaultHunger,
                        cleanliness: petData.defaultCleanliness,
                        status: PetStatus.Active,
                    },
                ],
                { session },
            )

            // 5. Deduct tokens from user using $inc (atomic operation)
            const updatedUser = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOneAndUpdate({ _id: user._id }, { $inc: { tokenNom: -petData.costNom } }, { new: true, session })
                .exec()

            if (!updatedUser) {
                throw new Error("Failed to update user tokens")
            }

            // 6. Commit transaction
            await session.commitTransaction()

            this.logger.debug(
                `Pet bought successfully: ${newOwnedPet._id} for ${player.walletAddress}, tokens: ${updatedUser.tokenNom}`,
            )

            return {
                pet: newOwnedPet,
                newTokenBalance: updatedUser.tokenNom,
            }
        } catch (error) {
            // Rollback on error
            await session.abortTransaction()
            this.logger.error(
                `Failed to buy pet (rolled back): ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        } finally {
            session.endSession()
        }
    }
}
