import { Injectable, Logger } from "@nestjs/common"
import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"
import {
    GetGameConfigPayload,
    GetPlayerStatePayload,
    GetProfilePayload,
    GetPetsStatePayload,
    ClaimDailyRewardPayload,
    UpdateSettingsPayload,
    UpdateTutorialPayload,
} from "@modules/gameplay"

interface SettingsData {
    name?: string
    preferences?: Record<string, unknown>
}

interface TutorialData {
    step?: string
    completed?: boolean
    progress?: Record<string, unknown>
}

@Injectable()
export class PlayerMessageHandlers {
    private readonly logger = new Logger(PlayerMessageHandlers.name)

    requestGameConfig(room: GameRoom) {
        return (client: Client): GetGameConfigPayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
            }
        }
    }

    requestPlayerState(room: GameRoom) {
        return (client: Client): GetPlayerStatePayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
            }
        }
    }

    getProfile(room: GameRoom) {
        return (client: Client): GetProfilePayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
            }
        }
    }

    requestPetsState(room: GameRoom) {
        return (client: Client, data: unknown = {}): GetPetsStatePayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
                data,
            }
        }
    }

    claimDailyReward(room: GameRoom) {
        return (client: Client): ClaimDailyRewardPayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
            }
        }
    }

    updateSettings(room: GameRoom) {
        return (client: Client, data: SettingsData = {}): UpdateSettingsPayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
                settings: data as Record<string, unknown>,
            }
        }
    }

    updateTutorial(room: GameRoom) {
        return (client: Client, data: TutorialData = {}): UpdateTutorialPayload => {
            return {
                room,
                client,
                sessionId: client.sessionId,
                tutorialData: data as Record<string, unknown>,
            }
        }
    }
}
