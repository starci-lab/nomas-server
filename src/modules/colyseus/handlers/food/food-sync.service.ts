import { PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { InjectGameMongoose, MemdbStorageService, StoreItemSchema, UserSchema } from "@modules/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Connection } from "mongoose"

export interface PurchaseFoodData {
    itemType: string
    quantity: number
}

export interface PurchaseFoodTransactionResult {
    itemData: StoreItemSchema
    newTokenBalance: number
    totalCost: number
}

@Injectable()
export class FoodSyncService {
    private readonly logger = new Logger(FoodSyncService.name)
    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
        private readonly memdbStorageService: MemdbStorageService,
    ) {}

    /**
     * Purchase food with transaction - ensures atomicity
     * If any step fails, all changes are rolled back
     * @param player - Player colyseus schema
     * @param purchaseData - Food purchase data
     * @returns Promise<PurchaseFoodTransactionResult | null>
     */
    async purchaseFoodWithTransaction(
        player: PlayerColyseusSchema,
        purchaseData: PurchaseFoodData,
    ): Promise<PurchaseFoodTransactionResult | null> {
        // 1. Get food item data from memory storage
        const foodItem = this.memdbStorageService
            .getStoreItems()
            .find((item) => item.displayId === purchaseData.itemType && item.type === "food")

        if (!foodItem) {
            this.logger.error(`Food item not found: ${purchaseData.itemType}`)
            return null
        }

        const totalCost = foodItem.costNom * purchaseData.quantity

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
            if (user.tokenNom < totalCost) {
                throw new Error(`Not enough tokens. Required: ${totalCost}, Available: ${user.tokenNom}`)
            }

            // 4. Deduct tokens from user using $inc (atomic operation)
            const updatedUser = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOneAndUpdate({ _id: user._id }, { $inc: { tokenNom: -totalCost } }, { new: true, session })
                .exec()

            if (!updatedUser) {
                throw new Error("Failed to update user tokens")
            }

            // 5. TODO: Add inventory record to DB (if you have InventorySchema)
            // For now, we'll just handle tokens transaction
            // You can add inventory DB sync here later

            // 6. Commit transaction
            await session.commitTransaction()

            this.logger.debug(
                `Food purchased successfully: ${purchaseData.quantity}x ${foodItem.name} for ${player.walletAddress}, tokens: ${updatedUser.tokenNom}`,
            )

            return {
                itemData: foodItem,
                newTokenBalance: updatedUser.tokenNom,
                totalCost,
            }
        } catch (error) {
            // Rollback on error
            await session.abortTransaction()
            this.logger.error(
                `Failed to purchase food (rolled back): ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        } finally {
            session.endSession()
        }
    }

    /**
     * Get user by wallet address
     */
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
