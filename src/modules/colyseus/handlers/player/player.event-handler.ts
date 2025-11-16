import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { Client } from "colyseus"
import { GamePlayerEvent } from "@modules/colyseus/events"
import {
    GetGameConfigPayload,
    GetPlayerStatePayload,
    GetProfilePayload,
    GetPetsStatePayload,
    ClaimDailyRewardPayload,
    UpdateSettingsPayload,
    UpdateTutorialPayload,
} from "./types"
import { GameRoomColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import {
    SendGameConfigResponsePayload,
    SendPlayerStateResponsePayload,
    SendProfileResponsePayload,
    SendPetsStateResponsePayload,
    SendDailyRewardResponsePayload,
    SendSettingsResponsePayload,
    SendTutorialResponsePayload,
} from "@modules/colyseus/events"

// Type for sender room methods
type SenderRoom = {
    sendGameConfigResponse: (client: Client, payload: SendGameConfigResponsePayload) => void
    sendPlayerStateResponse: (client: Client, payload: SendPlayerStateResponsePayload) => void
    sendProfileResponse: (client: Client, payload: SendProfileResponsePayload) => void
    sendPetsStateResponse: (client: Client, payload: SendPetsStateResponsePayload) => void
    sendDailyRewardResponse: (client: Client, payload: SendDailyRewardResponsePayload) => void
    sendSettingsResponse: (client: Client, payload: SendSettingsResponsePayload) => void
    sendTutorialResponse: (client: Client, payload: SendTutorialResponsePayload) => void
}

/**
 * Player Event Handler - Business logic layer
 * Handles all player-related game logic directly without calling gameplay services
 */
@Injectable()
export class PlayerEventHandler {
    private readonly logger = new Logger(PlayerEventHandler.name)

    @OnEvent(GamePlayerEvent.GetGameConfigRequested)
    async onGetGameConfig(payload: GetGameConfigPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetGameConfigRequested}`)
        try {
            // TODO: Implement get game config logic
            this.logger.warn("Get game config not yet implemented")

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendGameConfigResponse(payload.client, {
                success: true,
                config: {},
                message: "Game config retrieved",
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle get game config: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendGameConfigResponse(payload.client, {
                success: false,
                message: "Failed to get game config",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePlayerEvent.GetPlayerStateRequested)
    async onGetPlayerState(payload: GetPlayerStatePayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetPlayerStateRequested}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendPlayerStateResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            // TODO: Implement get player state logic
            this.logger.warn("Get player state not yet implemented")

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendPlayerStateResponse(payload.client, {
                success: true,
                message: "Get player state (placeholder)",
                data: { player },
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle get player state: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendPlayerStateResponse(payload.client, {
                success: false,
                message: "Failed to get player state",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePlayerEvent.GetProfileRequested)
    async onGetProfile(payload: GetProfilePayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetProfileRequested}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendProfileResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            // TODO: Implement get profile logic
            this.logger.warn("Get profile not yet implemented")

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendProfileResponse(payload.client, {
                success: true,
                message: "Get profile (placeholder)",
                data: { profile: {} },
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle get profile: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendProfileResponse(payload.client, {
                success: false,
                message: "Failed to get profile",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePlayerEvent.GetPetsStateRequested)
    async onGetPetsState(payload: GetPetsStatePayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetPetsStateRequested}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendPetsStateResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            // TODO: Implement get pets state logic
            this.logger.warn("Get pets state not yet implemented")

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendPetsStateResponse(payload.client, {
                success: true,
                message: "Get pets state (placeholder)",
                data: { pets: [] },
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle get pets state: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendPetsStateResponse(payload.client, {
                success: false,
                message: "Failed to get pets state",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePlayerEvent.ClaimDailyRewardRequested)
    async onClaimDailyReward(payload: ClaimDailyRewardPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.ClaimDailyRewardRequested}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendDailyRewardResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            // TODO: Implement claim daily reward logic
            this.logger.warn("Claim daily reward not yet implemented")

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendDailyRewardResponse(payload.client, {
                success: true,
                message: "Claim daily reward (placeholder)",
                data: {},
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle claim daily reward: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendDailyRewardResponse(payload.client, {
                success: false,
                message: "Failed to claim daily reward",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePlayerEvent.UpdateSettingsRequested)
    async onUpdateSettings(payload: UpdateSettingsPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.UpdateSettingsRequested}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendSettingsResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            // TODO: Implement update settings logic
            this.logger.warn("Update settings not yet implemented")

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendSettingsResponse(payload.client, {
                success: true,
                message: "Update settings (placeholder)",
                data: { settings: payload.settings || {} },
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle update settings: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendSettingsResponse(payload.client, {
                success: false,
                message: "Failed to update settings",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    @OnEvent(GamePlayerEvent.UpdateTutorialRequested)
    async onUpdateTutorial(payload: UpdateTutorialPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.UpdateTutorialRequested}`)
        try {
            const player = this.getPlayer(payload.room.state as GameRoomColyseusSchema, payload.sessionId)
            if (!player) {
                const senderRoom = payload.room as unknown as SenderRoom
                senderRoom.sendTutorialResponse(payload.client, {
                    success: false,
                    message: "Player not found in room",
                    error: "Player not found in room",
                    timestamp: Date.now(),
                })
                return
            }

            // TODO: Implement update tutorial logic
            this.logger.warn("Update tutorial not yet implemented")

            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendTutorialResponse(payload.client, {
                success: true,
                message: "Update tutorial (placeholder)",
                data: { tutorialData: payload.tutorialData || {} },
                timestamp: Date.now(),
            })
        } catch (error) {
            this.logger.error(`Failed to handle update tutorial: ${error.message}`, error.stack)
            const senderRoom = payload.room as unknown as SenderRoom
            senderRoom.sendTutorialResponse(payload.client, {
                success: false,
                message: "Failed to update tutorial",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: Date.now(),
            })
        }
    }

    // Helper methods
    private getPlayer(state: GameRoomColyseusSchema, sessionId: string): PlayerColyseusSchema | undefined {
        return state.players.get(sessionId)
    }
}
