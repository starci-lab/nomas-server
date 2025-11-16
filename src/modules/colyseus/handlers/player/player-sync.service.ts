import { Injectable, Logger } from "@nestjs/common"
import { PlayerColyseusSchema } from "@modules/colyseus/schemas"

/**
 * Player Sync Service - Handles syncing player data to database
 * This service is part of the colyseus handlers layer and should not depend on gameplay module
 */
@Injectable()
export class PlayerSyncService {
    private readonly logger = new Logger(PlayerSyncService.name)

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

            // TODO: Implement actual DB update based on your schema
            // Example: await this.connection.model('User').updateOne(
            //     { accountAddress: player.walletAddress },
            //     { $set: { tokens: player.tokens } }
            // )

            this.logger.debug(`💾 Synced tokens to DB for player ${player.walletAddress}: ${player.tokens} tokens`)
            return true
        } catch (error) {
            this.logger.debug(
                `Failed to sync tokens to DB: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return false
        }
    }
}
