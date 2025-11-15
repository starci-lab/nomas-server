import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"

export enum GamePlayerEvent {
    GetGameConfigRequested = "game.player.getGameConfigRequested",
    GetPlayerStateRequested = "game.player.getPlayerStateRequested",
    GetProfileRequested = "game.player.getProfileRequested",
    GetPetsStateRequested = "game.player.getPetsStateRequested",
    ClaimDailyRewardRequested = "game.player.claimDailyRewardRequested",
    UpdateSettingsRequested = "game.player.updateSettingsRequested",
    UpdateTutorialRequested = "game.player.updateTutorialRequested",
}

export interface PlayerEventBasePayload {
    room: GameRoom
    client: Client
    sessionId: string
}

export interface GetGameConfigPayload extends PlayerEventBasePayload {}

export interface GetPlayerStatePayload extends PlayerEventBasePayload {}

export interface GetProfilePayload extends PlayerEventBasePayload {}

export interface GetPetsStatePayload extends PlayerEventBasePayload {
    data?: unknown
}

export interface ClaimDailyRewardPayload extends PlayerEventBasePayload {}

export interface UpdateSettingsPayload extends PlayerEventBasePayload {
    settings?: Record<string, unknown>
}

export interface UpdateTutorialPayload extends PlayerEventBasePayload {
    tutorialData?: Record<string, unknown>
}

export type AnyPlayerEventPayload =
    | GetGameConfigPayload
    | GetPlayerStatePayload
    | GetProfilePayload
    | GetPetsStatePayload
    | ClaimDailyRewardPayload
    | UpdateSettingsPayload
    | UpdateTutorialPayload
