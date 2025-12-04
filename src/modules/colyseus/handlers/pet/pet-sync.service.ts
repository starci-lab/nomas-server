import { PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { InjectGameMongoose, OwnedPetSchema, UserSchema } from "@modules/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Connection } from "mongoose"

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
