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
}

export interface ActionRequestPayload<Payload extends Record<string, unknown>> {
    message: GameActionRequestMessage
    data?: Payload
}