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

// Response event payloads
export interface PlayerResponseBasePayload {
    client: Client
    sessionId: string
}

export interface GetGameConfigResponsePayload extends PlayerResponseBasePayload {
    result: GetGameConfigResult
}

export interface GetPlayerStateResponsePayload extends PlayerResponseBasePayload {
    result: GetPlayerStateResult
}

export interface GetProfileResponsePayload extends PlayerResponseBasePayload {
    result: GetProfileResult
}

export interface GetPetsStateResponsePayload extends PlayerResponseBasePayload {
    result: GetPetsStateResult
}

export interface ClaimDailyRewardResponsePayload extends PlayerResponseBasePayload {
    result: ClaimDailyRewardResult
}

export interface UpdateSettingsResponsePayload extends PlayerResponseBasePayload {
    result: UpdateSettingsResult
}

export interface UpdateTutorialResponsePayload extends PlayerResponseBasePayload {
    result: UpdateTutorialResult
}

// Result types
export interface GetGameConfigResult {
    success: boolean
    message: string
    config?: Record<string, unknown>
    error?: string
}

export interface GetPlayerStateResult {
    success: boolean
    message: string
    data?: Record<string, unknown>
    error?: string
    player?: PlayerColyseusSchema
}

export interface GetProfileResult {
    success: boolean
    message: string
    data?: { profile: Record<string, unknown> }
    error?: string
    player?: PlayerColyseusSchema
}

export interface GetPetsStateResult {
    success: boolean
    message: string
    data?: { pets: Array<Record<string, unknown>> }
    error?: string
    player?: PlayerColyseusSchema
}

export interface ClaimDailyRewardResult {
    success: boolean
    message: string
    data?: Record<string, unknown>
    error?: string
    player?: PlayerColyseusSchema
}

export interface UpdateSettingsResult {
    success: boolean
    message: string
    data?: { settings: Record<string, unknown> }
    error?: string
    player?: PlayerColyseusSchema
}

export interface UpdateTutorialResult {
    success: boolean
    message: string
    data?: { tutorialData: Record<string, unknown> }
    error?: string
    player?: PlayerColyseusSchema
}
