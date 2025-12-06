import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common"
import {
    GetGameConfigPayload,
    GetPlayerStatePayload,
    GetProfilePayload,
    GetPetsStatePayload,
    ClaimDailyRewardPayload,
    UpdateSettingsPayload,
    UpdateTutorialPayload,
    GetGameConfigResult,
    GetPlayerStateResult,
    GetProfileResult,
    GetPetsStateResult,
    ClaimDailyRewardResult,
    UpdateSettingsResult,
    UpdateTutorialResult,
} from "./types"
import { GameRoomColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { PetSyncService } from "../pet/pet-sync.service"
import { AbstractPetStateGameRoom } from "@modules/colyseus/rooms/game/state-pet.room"
import { PlayerSyncService } from "./player-sync.service"

/**
 * Player Handler - Pure business logic layer
 * Handles all player-related game logic and returns results
 */
@Injectable()
export class PlayerHandler {
    private readonly logger = new Logger(PlayerHandler.name)
    constructor(
        @Inject(forwardRef(() => PlayerSyncService)) private readonly playerSyncService: PlayerSyncService,
        private readonly petSyncService: PetSyncService,
    ) {}

    async handleGetGameConfig(payload: GetGameConfigPayload): Promise<GetGameConfigResult> {
        this.logger.debug("Handling get game config", { payload })
        try {
            // TODO: Implement get game config logic
            this.logger.warn("Get game config not yet implemented")

            return {
                success: true,
                config: {},
                message: "Game config retrieved",
            }
        } catch (error) {
            this.logger.error(`Failed to handle get game config: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to get game config",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleGetPlayerState(payload: GetPlayerStatePayload): Promise<GetPlayerStateResult> {
        this.logger.debug("Handling get player state")
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            // TODO: Implement get player state logic
            this.logger.warn("Get player state not yet implemented")

            return {
                success: true,
                message: "Get player state (placeholder)",
                data: { player },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle get player state: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to get player state",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleGetProfile(payload: GetProfilePayload): Promise<GetProfileResult> {
        this.logger.debug("Handling get profile")
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            // TODO: Implement get profile logic
            this.logger.warn("Get profile not yet implemented")

            return {
                success: true,
                message: "Get profile (placeholder)",
                data: { profile: {} },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle get profile: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to get profile",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleGetPetsState(payload: GetPetsStatePayload): Promise<GetPetsStateResult> {
        this.logger.debug("Handling get pets state")
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            const stateRoom = payload.room as unknown as AbstractPetStateGameRoom
            const pets = await this.petSyncService.syncPetsStateFromDB(player, stateRoom)

            return {
                success: true,
                message: pets.length > 0 ? `Loaded ${pets.length} pets` : "No pets found",
                data: {
                    pets,
                    petsCount: pets.length,
                },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle get pets state: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to get pets state",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleClaimDailyReward(payload: ClaimDailyRewardPayload): Promise<ClaimDailyRewardResult> {
        this.logger.debug("Handling claim daily reward")
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            // TODO: Implement claim daily reward logic
            this.logger.warn("Claim daily reward not yet implemented")

            return {
                success: true,
                message: "Claim daily reward (placeholder)",
                data: {},
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle claim daily reward: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to claim daily reward",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleUpdateSettings(payload: UpdateSettingsPayload): Promise<UpdateSettingsResult> {
        this.logger.debug("Handling update settings")
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            // TODO: Implement update settings logic
            this.logger.warn("Update settings not yet implemented")

            return {
                success: true,
                message: "Update settings (placeholder)",
                data: { settings: payload.settings || {} },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle update settings: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to update settings",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleUpdateTutorial(payload: UpdateTutorialPayload): Promise<UpdateTutorialResult> {
        this.logger.debug("Handling update tutorial")
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                return {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                }
            }

            // TODO: Implement update tutorial logic
            this.logger.warn("Update tutorial not yet implemented")

            return {
                success: true,
                message: "Update tutorial (placeholder)",
                data: { tutorialData: payload.tutorialData || {} },
                player,
            }
        } catch (error) {
            this.logger.error(`Failed to handle update tutorial: ${error.message}`, error.stack)
            return {
                success: false,
                message: "Failed to update tutorial",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async handleSyncPlayerStateOnJoin(player: PlayerColyseusSchema): Promise<boolean> {
        this.logger.debug(`Syncing player state on join: ${player.walletAddress}`)
        try {
            const synced = await this.playerSyncService.syncPlayerStateFromDB(player)
            if (!synced) {
                this.logger.warn(`Failed to sync player state for ${player.walletAddress}`)
                return false
            }

            return true
        } catch (error) {
            this.logger.error(
                `Failed to sync player state on join: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return false
        }
    }

    // Helper methods
    private getPlayer(state: GameRoomColyseusSchema, sessionId: string): PlayerColyseusSchema | undefined {
        return state.players.get(sessionId)
    }
}
