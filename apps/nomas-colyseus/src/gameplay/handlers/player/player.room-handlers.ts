import { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"
import { GamePlayerMessages, GamePlayerEvent } from "@modules/gameplay"
import { PlayerMessageHandlers } from "./player.message-handlers"

/**
 * Player Room Handlers - Registers all player-related message handlers to the room
 */
export class PlayerRoomHandlers {
    constructor(
        private room: GameRoom,
        private playerMessages: PlayerMessageHandlers,
    ) {}

    register() {
        // Request Game Config
        this.room.onMessage(GamePlayerMessages.REQUEST_GAME_CONFIG, async (client: Client) => {
            const payload = this.playerMessages.requestGameConfig(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePlayerEvent.GetGameConfigRequested, payload)
            }
        })

        // Request Player State
        this.room.onMessage(GamePlayerMessages.REQUEST_PLAYER_STATE, async (client: Client) => {
            const payload = this.playerMessages.requestPlayerState(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePlayerEvent.GetPlayerStateRequested, payload)
            }
        })

        // Get Profile
        this.room.onMessage(GamePlayerMessages.GET_PROFILE, async (client: Client) => {
            const payload = this.playerMessages.getProfile(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePlayerEvent.GetProfileRequested, payload)
            }
        })

        // Request Pets State
        this.room.onMessage(GamePlayerMessages.REQUEST_PETS_STATE, async (client: Client, data: unknown = {}) => {
            const payload = this.playerMessages.requestPetsState(this.room)(client, data)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePlayerEvent.GetPetsStateRequested, payload)
            }
        })

        // Claim Daily Reward
        this.room.onMessage(GamePlayerMessages.CLAIM_DAILY_REWARD, async (client: Client) => {
            const payload = this.playerMessages.claimDailyReward(this.room)(client)
            if (payload && this.room.eventEmitterService) {
                await this.room.eventEmitterService.emit(GamePlayerEvent.ClaimDailyRewardRequested, payload)
            }
        })

        // Update Settings
        this.room.onMessage(
            GamePlayerMessages.UPDATE_SETTINGS,
            async (client: Client, data: { name?: string; preferences?: Record<string, unknown> } = {}) => {
                const payload = this.playerMessages.updateSettings(this.room)(client, data)
                if (payload && this.room.eventEmitterService) {
                    await this.room.eventEmitterService.emit(GamePlayerEvent.UpdateSettingsRequested, payload)
                }
            },
        )

        // Update Tutorial
        this.room.onMessage(
            GamePlayerMessages.UPDATE_TUTORIAL,
            async (
                client: Client,
                data: { step?: string; completed?: boolean; progress?: Record<string, unknown> } = {},
            ) => {
                const payload = this.playerMessages.updateTutorial(this.room)(client, data)
                if (payload && this.room.eventEmitterService) {
                    await this.room.eventEmitterService.emit(GamePlayerEvent.UpdateTutorialRequested, payload)
                }
            },
        )
    }
}
