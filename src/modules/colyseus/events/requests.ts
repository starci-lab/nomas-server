export enum GameActionRequestMessage {
    Purchase = "purchase",
    BuyFood = "buy_food",
    RemovePet = "remove_pet",
    BuyPet = "buy_pet",
    CleanedPet = "cleaned_pet",
    CreatePoop = "create_poop",
    GetCatalog = "get_catalog",
    GetInventory = "get_inventory",
    FeedPet = "feed_pet",
    // Food requests
    GetStoreCatalog = "get_store_catalog",
    GetFoodInventory = "get_food_inventory",
    // Inventory requests
    PurchaseItem = "purchase_item",
    // Player requests
    RequestGameConfig = "request_game_config",
    RequestPlayerState = "request_player_state",
    GetProfile = "get_profile",
    RequestPetsState = "request_pets_state",
    ClaimDailyReward = "claim_daily_reward",
    UpdateSettings = "update_settings",
    UpdateTutorial = "update_tutorial",
}

export interface ActionRequestPayload<Payload extends Record<string, unknown>> {
    message: GameActionRequestMessage
    data?: Payload
}
