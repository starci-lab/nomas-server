import { Client } from "colyseus"
import { PlayerColyseusSchema } from "@modules/colyseus/schemas"
import { GameRoom } from "@modules/colyseus/rooms/game"

// Base payload types
export interface PlayerEventBasePayload {
    room: GameRoom
    client: Client
    sessionId: string
}

export interface GetGameConfigPayload extends PlayerEventBasePayload {
    data?: unknown
}

export interface GetPlayerStatePayload extends PlayerEventBasePayload {
    data?: unknown
}

export interface GetProfilePayload extends PlayerEventBasePayload {
    data?: unknown
}

export interface GetPetsStatePayload extends PlayerEventBasePayload {
    data?: unknown
}

export interface ClaimDailyRewardPayload extends PlayerEventBasePayload {
    data?: unknown
}

export interface UpdateSettingsPayload extends PlayerEventBasePayload {
    settings?: Record<string, unknown>
}

export interface UpdateTutorialPayload extends PlayerEventBasePayload {
    tutorialData?: Record<string, unknown>
}

// Response payload types
export interface ActionResponsePayload {
    success: boolean
    message: string
    data?: Record<string, unknown>
    timestamp?: number
}
