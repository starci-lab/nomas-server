import { PetColyseusSchema, PlayerColyseusSchema, PoopColyseusSchema } from "@modules/colyseus/schemas"
import { AbstractPetStateGameRoom } from "@modules/colyseus/rooms/game/state-pet.room"
import {
    InjectGameMongoose,
    MemdbStorageService,
    OwnedPetSchema,
    PetSchema,
    PetStatus,
    UserSchema,
    StoreItemSchema,
    PoopSchema,
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

export interface CleanPetTransactionResult {
    updatedPet: OwnedPetSchema
    deletedPoop: PoopSchema
    newTokenBalance: number
    cleanlinessRestored: number
    cost: number
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

                // Load poops from DB
                if (pet.poops && pet.poops.length > 0) {
                    petSchema.poops = pet.poops.map((poop) => {
                        const poopSchema = new PoopColyseusSchema()
                        poopSchema.id = (poop._id as ObjectId)?.toString() || `poop-${Date.now()}`
                        poopSchema.petId = petSchema.id
                        poopSchema.positionX = poop.positionX
                        poopSchema.positionY = poop.positionY
                        return poopSchema
                    })
                }

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

    /**
     * Create poop with transaction
     * @param petId - Pet ID
     * @param positionX - X position
     * @param positionY - Y position
     * @returns Promise<{ poop: PoopSchema; updatedPet: OwnedPetSchema } | null>
     */
    async createPoopWithTransaction(
        petId: string,
        positionX: number,
        positionY: number,
    ): Promise<{ poop: PoopSchema; updatedPet: OwnedPetSchema } | null> {
        const session = await this.connection.startSession()

        try {
            session.startTransaction()

            // 1. Verify pet exists
            const pet = await this.connection
                .model<OwnedPetSchema>(OwnedPetSchema.name)
                .findById(petId)
                .session(session)
                .exec()

            if (!pet) {
                throw new Error(`Pet not found: ${petId}`)
            }

            // 2. Create poop as subdocument
            const newPoop: PoopSchema = {
                positionX: +positionX,
                positionY: +positionY,
            } as PoopSchema

            // 3. Add poop to pet's poops array
            const updatedPet = await this.connection
                .model<OwnedPetSchema>(OwnedPetSchema.name)
                .findByIdAndUpdate(petId, { $push: { poops: newPoop } }, { new: true, session })
                .exec()

            if (!updatedPet) {
                throw new Error("Failed to add poop to pet")
            }

            // 4. Commit transaction
            await session.commitTransaction()

            // Get the last poop (the one we just added)
            const createdPoop = updatedPet.poops[updatedPet.poops.length - 1]

            this.logger.debug(`Poop created successfully for pet ${petId}`)

            return {
                poop: createdPoop,
                updatedPet,
            }
        } catch (error) {
            // Rollback on error
            await session.abortTransaction()
            this.logger.error(
                `Failed to create poop (rolled back): ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        } finally {
            session.endSession()
        }
    }

    /**
     * Clean pet with transaction - ensures atomicity
     * @param petId - Pet ID
     * @param poopId - Poop ID to remove
     * @param cleaningItemId - Cleaning item ID from store
     * @param walletAddress - Player wallet address
     * @returns Promise<CleanPetTransactionResult | null>
     */
    async cleanPetWithTransaction(
        petId: string,
        poopId: string,
        cleaningItemId: string,
        walletAddress: string,
    ): Promise<CleanPetTransactionResult | null> {
        const session = await this.connection.startSession()

        try {
            session.startTransaction()

            // 1. Get cleaning item from DB
            const cleaningItem = await this.connection
                .model<StoreItemSchema>(StoreItemSchema.name)
                .findOne({ displayId: cleaningItemId })
                .session(session)
                .exec()

            if (!cleaningItem || !cleaningItem.effectCleanliness) {
                throw new Error(`Invalid cleaning item: ${cleaningItemId}`)
            }

            const cleanlinessRestore = cleaningItem.effectCleanliness
            const cost = cleaningItem.costNom

            // 2. Get pet from DB
            const pet = await this.connection
                .model<OwnedPetSchema>(OwnedPetSchema.name)
                .findById(petId)
                .session(session)
                .exec()

            if (!pet) {
                throw new Error(`Pet not found: ${petId}`)
            }

            // 3. Verify poop exists in pet's poops array
            const poopIndex = pet.poops.findIndex((p) => p._id?.toString() === poopId)
            if (poopIndex === -1) {
                throw new Error(`Poop not found on this pet: ${poopId}`)
            }

            // 4. Calculate new cleanliness (max 100)
            const newCleanliness = Math.min(pet.cleanliness + cleanlinessRestore, 100)

            // 5. Get user and check tokens
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOne({ accountAddress: walletAddress })
                .session(session)
                .exec()

            if (!user) {
                throw new Error(`User not found: ${walletAddress}`)
            }

            if (user.tokenNom < cost) {
                throw new Error(`Not enough tokens. Need ${cost}, have ${user.tokenNom}`)
            }

            // 6. Update pet: set cleanliness, update timestamp, remove poop
            const updatedPet = await this.connection
                .model<OwnedPetSchema>(OwnedPetSchema.name)
                .findByIdAndUpdate(
                    petId,
                    {
                        $set: {
                            cleanliness: newCleanliness,
                            lastUpdateCleanliness: new Date(),
                        },
                        $pull: { poops: { _id: poopId } },
                    },
                    { new: true, session },
                )
                .exec()

            if (!updatedPet) {
                throw new Error("Failed to update pet")
            }

            // 7. Deduct tokens from user
            const updatedUser = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOneAndUpdate({ _id: user._id }, { $inc: { tokenNom: -cost } }, { new: true, session })
                .exec()

            if (!updatedUser) {
                throw new Error("Failed to update user tokens")
            }

            // 8. Commit transaction
            await session.commitTransaction()

            this.logger.debug(
                `Pet cleaned successfully: ${petId}, cleanliness: ${newCleanliness}, cost: ${cost}, tokens: ${updatedUser.tokenNom}`,
            )

            return {
                updatedPet,
                deletedPoop: pet.poops[poopIndex],
                newTokenBalance: updatedUser.tokenNom,
                cleanlinessRestored: cleanlinessRestore,
                cost,
            }
        } catch (error) {
            // Rollback on error
            await session.abortTransaction()
            this.logger.error(
                `Failed to clean pet (rolled back): ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        } finally {
            session.endSession()
        }
    }
}
