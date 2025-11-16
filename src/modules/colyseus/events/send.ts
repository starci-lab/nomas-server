export enum GameActionSendMessage {
    Welcome = "welcome",
    Catalog = "catalog",
    GetInventory = "get_inventory",
    // Food responses
    StoreCatalog = "store_catalog",
    FoodInventory = "food_inventory",
    FeedResult = "feed_result",
    // Inventory responses
    PurchaseResponse = "purchase_response",
    InventoryResponse = "inventory_response",
    // Pet responses
    BuyPetResponse = "buy_pet_response",
    RemovePetResponse = "remove_pet_response",
    CleanedPetResponse = "cleaned_pet_response",
    CreatePoopResponse = "create_poop_response",
    ActionResponse = "action_response",
    PetsStateSync = "pets_state_sync",
    // Player responses
    GameConfigResponse = "game_config_response",
    PlayerStateResponse = "player_state_response",
    ProfileResponse = "profile_response",
    PetsStateResponse = "pets_state_response",
    DailyRewardResponse = "daily_reward_response",
    SettingsResponse = "settings_response",
    TutorialResponse = "tutorial_response",
}

export interface SendWelcomePayload {
    message: string
    roomId: string
}

export interface SendCatalogPayload {
    catalog: Array<Record<string, unknown>>
}

export interface SendInventoryPayload {
    inventory: Array<Record<string, unknown>>
}

// Food send payloads
export interface SendStoreCatalogPayload {
    success: boolean
    data?: { catalog: Record<string, unknown> }
    message?: string
    error?: string
    timestamp?: number
}

export interface SendFoodInventoryPayload {
    success: boolean
    data?: { inventory: Record<string, unknown> }
    message?: string
    error?: string
    timestamp?: number
}

export interface SendFeedResultPayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

// Inventory send payloads
export interface SendPurchaseResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendInventoryResponsePayload {
    success: boolean
    data?: { inventory: Record<string, unknown> }
    tokens?: number
    message?: string
    error?: string
    timestamp?: number
}

// Player send payloads
export interface SendGameConfigResponsePayload {
    success: boolean
    config?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendPlayerStateResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendProfileResponsePayload {
    success: boolean
    data?: { profile: Record<string, unknown> }
    message?: string
    error?: string
    timestamp?: number
}

export interface SendPetsStateResponsePayload {
    success: boolean
    data?: { pets: Array<Record<string, unknown>> }
    message?: string
    error?: string
    timestamp?: number
}

export interface SendDailyRewardResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendSettingsResponsePayload {
    success: boolean
    data?: { settings: Record<string, unknown> }
    message?: string
    error?: string
    timestamp?: number
}

export interface SendTutorialResponsePayload {
    success: boolean
    data?: { tutorialData: Record<string, unknown> }
    message?: string
    error?: string
    timestamp?: number
}

// Pet send payloads
export interface SendBuyPetResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendRemovePetResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendCleanedPetResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendCreatePoopResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendActionResponsePayload {
    success: boolean
    data?: Record<string, unknown>
    message?: string
    error?: string
    timestamp?: number
}

export interface SendPetsStateSyncPayload {
    pets: Array<Record<string, unknown>>
    timestamp?: number
}
