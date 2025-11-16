export enum GameActionReceiveMessage {
    BuyPet = "buy_pet",
    GetCatalog = "get_catalog",
    GetInventory = "get_inventory",
    // Food messages
    BuyFood = "buy_food",
    GetStoreCatalog = "get_store_catalog",
    GetFoodInventory = "get_food_inventory",
    FeedPet = "feed_pet",
    // Inventory messages
    PurchaseItem = "purchase_item",
    // Player messages
    RequestGameConfig = "request_game_config",
    RequestPlayerState = "request_player_state",
    GetProfile = "get_profile",
    RequestPetsState = "request_pets_state",
    ClaimDailyReward = "claim_daily_reward",
    UpdateSettings = "update_settings",
    UpdateTutorial = "update_tutorial",
}

export interface ReceiveBuyPetPayload {
    petType?: string
    petTypeId?: string
    isBuyPet?: boolean
}

export interface ReceiveGetCatalogPayload {
    page?: number
    limit?: number
}

export interface ReceiveGetInventoryPayload {
    page?: number
    limit?: number
}

// Food receive payloads
export interface ReceiveBuyFoodPayload {
    itemId?: string
    itemType?: string
    itemName?: string
    quantity?: number
}

export interface ReceiveGetStoreCatalogPayload {
    page?: number
    limit?: number
}

export interface ReceiveGetFoodInventoryPayload {
    page?: number
    limit?: number
}

export interface ReceiveFeedPetPayload {
    petId?: string
    foodType?: string
    quantity?: number
}

// Inventory receive payloads
export interface ReceivePurchaseItemPayload {
    itemId?: string
    itemType?: string
    quantity?: number
}

// Player receive payloads
export interface ReceiveRequestGameConfigPayload {
    data?: unknown
}

export interface ReceiveRequestPlayerStatePayload {
    data?: unknown
}

export interface ReceiveGetProfilePayload {
    data?: unknown
}

export interface ReceiveRequestPetsStatePayload {
    data?: unknown
}

export interface ReceiveClaimDailyRewardPayload {
    data?: unknown
}

export interface ReceiveUpdateSettingsPayload {
    name?: string
    preferences?: Record<string, unknown>
}

export interface ReceiveUpdateTutorialPayload {
    step?: string
    completed?: boolean
    progress?: Record<string, unknown>
}
