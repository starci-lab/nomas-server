import { Injectable, Logger } from "@nestjs/common"
import { InventoryItemColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { Connection } from "mongoose"
import { InjectGameMongoose, InventorySchema, StoreItemSchema, UserSchema } from "@modules/databases"

/**
 * Player Sync Service - Handles syncing player data to database
 * This service is part of the colyseus handlers layer and should not depend on gameplay module
 */
@Injectable()
export class PlayerSyncService {
    private readonly logger = new Logger(PlayerSyncService.name)
    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    /**
     * Sync player tokens to database
     * @param player - Player schema from colyseus state
     * @returns Promise<boolean> - true if sync was successful
     */
    async syncTokensToDB(player: PlayerColyseusSchema): Promise<boolean> {
        try {
            if (!player.walletAddress) {
                this.logger.warn(`Cannot sync tokens: player ${player.sessionId} has no walletAddress`)
                return false
            }

            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne({ accountAddress: player.walletAddress }, { $set: { tokenNom: player.tokens } })

            this.logger.debug(`💾 Synced tokens to DB for player ${player.walletAddress}: ${player.tokens} tokens`)
            return true
        } catch (error) {
            this.logger.debug(
                `Failed to sync tokens to DB: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return false
        }
    }

    /**
     * Load player data from database
     * @param walletAddress - Player's wallet address
     * @returns Promise<UserSchema | null>
     */
    async loadPlayerFromDB(walletAddress: string): Promise<UserSchema | null> {
        try {
            if (!walletAddress) {
                this.logger.warn("Cannot load player: no walletAddress provided")
                return null
            }

            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findOne({ accountAddress: walletAddress })
                .exec()

            if (!user) {
                this.logger.debug(`Player not found in DB: ${walletAddress}`)
                return null
            }

            this.logger.debug(`Loaded player from DB: ${walletAddress}`)
            return user
        } catch (error) {
            this.logger.error(
                `Failed to load player from DB: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        }
    }

    /**
     * Sync player state from database to colyseus schema
     * @param player - Player colyseus schema to update
     * @returns Promise<boolean> - true if sync was successful
     */
    async syncPlayerStateFromDB(player: PlayerColyseusSchema): Promise<boolean> {
        try {
            const userFromDB = await this.loadPlayerFromDB(player.walletAddress)
            if (!userFromDB) {
                this.logger.warn(`Cannot sync state: player ${player.walletAddress} not found in DB`)
                return false
            }

            player.tokens = userFromDB.tokenNom

            // Sync inventory state from DB to colyseus schema
            const inventories = await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .find({ user: userFromDB._id })
                .populate("storeItem")
                .exec()

            // Clear current in-memory inventory to reflect DB state
            player.inventory.clear()

            for (const inv of inventories as (InventorySchema & { storeItem: StoreItemSchema })[]) {
                const storeItem = inv.storeItem as unknown as StoreItemSchema
                if (!storeItem) continue

                const itemType = storeItem.type as unknown as string
                const itemId = storeItem.id.toString()
                const itemName = storeItem.name
                const quantity = inv.quantity ?? 1

                const itemKey = `${itemType}_${itemId}`

                let inventoryItem = player.inventory.get(itemKey)
                if (!inventoryItem) {
                    inventoryItem = new InventoryItemColyseusSchema()
                    inventoryItem.itemType = itemType
                    inventoryItem.itemId = itemId
                    inventoryItem.itemName = itemName
                    inventoryItem.quantity = 0
                    inventoryItem.totalPurchased = 0
                    player.inventory.set(itemKey, inventoryItem)
                }

                inventoryItem.quantity += quantity
                inventoryItem.totalPurchased += quantity
            }

            return true
        } catch (error) {
            this.logger.error(
                `Failed to sync player state from DB: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return false
        }
    }
}
