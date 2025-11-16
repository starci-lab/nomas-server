import { Injectable, Logger } from "@nestjs/common"
import { InjectConnection } from "@nestjs/mongoose"
import { Connection } from "mongoose"
import { Client } from "colyseus"
import { GameRoomColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { GamePlayerActionMessages } from "./player.constants"
import {
    GetGameConfigPayload,
    GetPlayerStatePayload,
    GetProfilePayload,
    GetPetsStatePayload,
    ClaimDailyRewardPayload,
    UpdateSettingsPayload,
    UpdateTutorialPayload,
} from "./player.events"
import { GAME_MONGOOSE_CONNECTION_NAME } from "@modules/databases/mongodb/game/constants"

type ActionResponsePayload = {
    success: boolean
    message: string
    data?: Record<string, unknown>
}

@Injectable()
export class PlayerGameService {
    private readonly logger = new Logger(PlayerGameService.name)

    constructor(@InjectConnection(GAME_MONGOOSE_CONNECTION_NAME) private connection: Connection) {}

    async handleGetGameConfig({ client }: GetGameConfigPayload) {
        // TODO: Implement get game config logic
        this.logger.warn("handleGetGameConfig not yet implemented")
        client.send(GamePlayerActionMessages.GAME_CONFIG_RESPONSE, {
            success: true,
            config: {},
        })
    }

    async handleGetPlayerState({ room, client, sessionId }: GetPlayerStatePayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GamePlayerActionMessages.PLAYER_STATE_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement get player state logic
        this.logger.warn("handleGetPlayerState not yet implemented")
        this.sendActionResponse(client, GamePlayerActionMessages.PLAYER_STATE_RESPONSE, {
            success: true,
            message: "Get player state (placeholder)",
            data: { player },
        })
    }

    async handleGetProfile({ room, client, sessionId }: GetProfilePayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GamePlayerActionMessages.PROFILE_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement get profile logic
        this.logger.warn("handleGetProfile not yet implemented")
        this.sendActionResponse(client, GamePlayerActionMessages.PROFILE_RESPONSE, {
            success: true,
            message: "Get profile (placeholder)",
            data: { profile: {} },
        })
    }

    async handleGetPetsState({ room, client, sessionId }: GetPetsStatePayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GamePlayerActionMessages.PETS_STATE_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement get pets state logic
        this.logger.warn("handleGetPetsState not yet implemented")
        this.sendActionResponse(client, GamePlayerActionMessages.PETS_STATE_RESPONSE, {
            success: true,
            message: "Get pets state (placeholder)",
            data: { pets: [] },
        })
    }

    async handleClaimDailyReward({ room, client, sessionId }: ClaimDailyRewardPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GamePlayerActionMessages.DAILY_REWARD_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement claim daily reward logic
        this.logger.warn("handleClaimDailyReward not yet implemented")
        this.sendActionResponse(client, GamePlayerActionMessages.DAILY_REWARD_RESPONSE, {
            success: true,
            message: "Claim daily reward (placeholder)",
            data: {},
        })
    }

    async handleUpdateSettings({ room, client, sessionId, settings }: UpdateSettingsPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GamePlayerActionMessages.SETTINGS_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement update settings logic
        this.logger.warn("handleUpdateSettings not yet implemented")
        this.sendActionResponse(client, GamePlayerActionMessages.SETTINGS_RESPONSE, {
            success: true,
            message: "Update settings (placeholder)",
            data: { settings },
        })
    }

    async handleUpdateTutorial({ room, client, sessionId, tutorialData }: UpdateTutorialPayload) {
        const player = this.getPlayer(room.state, sessionId)
        if (!player) {
            this.sendActionResponse(client, GamePlayerActionMessages.TUTORIAL_RESPONSE, {
                success: false,
                message: "Player not found in room",
            })
            return
        }

        // TODO: Implement update tutorial logic
        this.logger.warn("handleUpdateTutorial not yet implemented")
        this.sendActionResponse(client, GamePlayerActionMessages.TUTORIAL_RESPONSE, {
            success: true,
            message: "Update tutorial (placeholder)",
            data: { tutorialData },
        })
    }

    /**
     * Sync tokens to database immediately
     * This is called when tokens are updated (purchase, buy pet, etc.)
     * Tokens must be synced immediately for data integrity
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
            this.logger.error(
                `❌ Failed to sync tokens to DB: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return false
        }
    }

    private getPlayer(state: GameRoomColyseusSchema, sessionId: string) {
        return state.players.get(sessionId)
    }

    private sendActionResponse(client: Client, messageType: string, payload: ActionResponsePayload) {
        client.send(messageType, {
            success: payload.success,
            message: payload.message,
            data: payload.data ?? {},
            timestamp: Date.now(),
        })
    }
}
