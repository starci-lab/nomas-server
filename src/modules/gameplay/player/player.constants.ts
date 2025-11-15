export const GamePlayerMessages = {
    REQUEST_GAME_CONFIG: "request_game_config",
    REQUEST_PLAYER_STATE: "request_player_state",
    GET_PROFILE: "get_profile",
    REQUEST_PETS_STATE: "request_pets_state",
    CLAIM_DAILY_REWARD: "claim_daily_reward",
    UPDATE_SETTINGS: "update_settings",
    UPDATE_TUTORIAL: "update_tutorial",
} as const

export const GamePlayerActionMessages = {
    GAME_CONFIG_RESPONSE: "game_config_response",
    PLAYER_STATE_RESPONSE: "player_state_response",
    PROFILE_RESPONSE: "profile_response",
    PETS_STATE_RESPONSE: "pets_state_response",
    DAILY_REWARD_RESPONSE: "daily_reward_response",
    SETTINGS_RESPONSE: "settings_response",
    TUTORIAL_RESPONSE: "tutorial_response",
} as const
