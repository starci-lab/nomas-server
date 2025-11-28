// Event enums for Colyseus handlers
// These events are used internally within the colyseus module

export enum GamePetEvent {
    BuyRequested = "game.pet.buyRequested",
    RemoveRequested = "game.pet.removeRequested",
    FeedRequested = "game.pet.feedRequested",
    PlayRequested = "game.pet.playRequested",
    CleanRequested = "game.pet.cleanRequested",
    FoodConsumed = "game.pet.foodConsumed",
    Cleaned = "game.pet.cleaned",
    Played = "game.pet.played",
    PoopCreated = "game.pet.poopCreated",
    BuyResponse = "game.pet.buyResponse",
    RemoveResponse = "game.pet.removeResponse",
    FeedResponse = "game.pet.feedResponse",
    PlayResponse = "game.pet.playResponse",
    CleanResponse = "game.pet.cleanResponse",
    CleanedResponse = "game.pet.cleanedResponse",
    CreatePoopResponse = "game.pet.createPoopResponse",
}

export enum GameFoodEvent {
    PurchaseRequested = "game.food.purchaseRequested",
    GetCatalogRequested = "game.food.getCatalogRequested",
    GetInventoryRequested = "game.food.getInventoryRequested",
    FeedPetRequested = "game.food.feedPetRequested",
    PurchaseResponse = "game.food.purchaseResponse",
    GetCatalogResponse = "game.food.getCatalogResponse",
    GetInventoryResponse = "game.food.getInventoryResponse",
    FeedPetResponse = "game.food.feedPetResponse",
}

export enum GameInventoryEvent {
    PurchaseItemRequested = "game.inventory.purchaseItemRequested",
    GetInventoryRequested = "game.inventory.getInventoryRequested",
    PurchaseItemResponse = "game.inventory.purchaseItemResponse",
    GetInventoryResponse = "game.inventory.getInventoryResponse",
}

export enum GamePlayerEvent {
    GetGameConfigRequested = "game.player.getGameConfigRequested",
    GetPlayerStateRequested = "game.player.getPlayerStateRequested",
    GetProfileRequested = "game.player.getProfileRequested",
    GetPetsStateRequested = "game.player.getPetsStateRequested",
    ClaimDailyRewardRequested = "game.player.claimDailyRewardRequested",
    UpdateSettingsRequested = "game.player.updateSettingsRequested",
    UpdateTutorialRequested = "game.player.updateTutorialRequested",
    GetGameConfigResponse = "game.player.getGameConfigResponse",
    GetPlayerStateResponse = "game.player.getPlayerStateResponse",
    GetProfileResponse = "game.player.getProfileResponse",
    GetPetsStateResponse = "game.player.getPetsStateResponse",
    ClaimDailyRewardResponse = "game.player.claimDailyRewardResponse",
    UpdateSettingsResponse = "game.player.updateSettingsResponse",
    UpdateTutorialResponse = "game.player.updateTutorialResponse",
}
