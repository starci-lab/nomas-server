import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { PlayerGameService } from "@modules/gameplay/player/player.service"
import { GamePlayerEvent } from "@modules/colyseus/events"
import {
    GetGameConfigPayload,
    GetPlayerStatePayload,
    GetProfilePayload,
    GetPetsStatePayload,
    ClaimDailyRewardPayload,
    UpdateSettingsPayload,
    UpdateTutorialPayload,
} from "@modules/gameplay"

@Injectable()
export class PlayerEventHandler {
    private readonly logger = new Logger(PlayerEventHandler.name)
    constructor(private readonly playerGameService: PlayerGameService) {}

    @OnEvent(GamePlayerEvent.GetGameConfigRequested)
    async onGetGameConfig(payload: GetGameConfigPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetGameConfigRequested}`)
        try {
            await this.playerGameService.handleGetGameConfig(payload)
        } catch (error) {
            this.logger.error(`Failed to handle get game config: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePlayerEvent.GetPlayerStateRequested)
    async onGetPlayerState(payload: GetPlayerStatePayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetPlayerStateRequested}`)
        try {
            await this.playerGameService.handleGetPlayerState(payload)
        } catch (error) {
            this.logger.error(`Failed to handle get player state: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePlayerEvent.GetProfileRequested)
    async onGetProfile(payload: GetProfilePayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetProfileRequested}`)
        try {
            await this.playerGameService.handleGetProfile(payload)
        } catch (error) {
            this.logger.error(`Failed to handle get profile: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePlayerEvent.GetPetsStateRequested)
    async onGetPetsState(payload: GetPetsStatePayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.GetPetsStateRequested}`)
        try {
            await this.playerGameService.handleGetPetsState(payload)
        } catch (error) {
            this.logger.error(`Failed to handle get pets state: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePlayerEvent.ClaimDailyRewardRequested)
    async onClaimDailyReward(payload: ClaimDailyRewardPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.ClaimDailyRewardRequested}`)
        try {
            await this.playerGameService.handleClaimDailyReward(payload)
        } catch (error) {
            this.logger.error(`Failed to handle claim daily reward: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePlayerEvent.UpdateSettingsRequested)
    async onUpdateSettings(payload: UpdateSettingsPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.UpdateSettingsRequested}`)
        try {
            await this.playerGameService.handleUpdateSettings(payload)
        } catch (error) {
            this.logger.error(`Failed to handle update settings: ${error.message}`, error.stack)
            throw error
        }
    }

    @OnEvent(GamePlayerEvent.UpdateTutorialRequested)
    async onUpdateTutorial(payload: UpdateTutorialPayload) {
        this.logger.debug(`Event received: ${GamePlayerEvent.UpdateTutorialRequested}`)
        try {
            await this.playerGameService.handleUpdateTutorial(payload)
        } catch (error) {
            this.logger.error(`Failed to handle update tutorial: ${error.message}`, error.stack)
            throw error
        }
    }
}
