import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game"

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

export interface FoodEventBasePayload {
    room: GameRoom
    client: Client
    sessionId: string
}

export interface PurchaseFoodPayload extends FoodEventBasePayload {
    itemId: string
    itemType: string
    itemName: string
    quantity: number
}

export interface GetCatalogPayload extends FoodEventBasePayload {
    client: Client
}

export interface GetFoodInventoryPayload extends FoodEventBasePayload {
    client: Client
}

export interface FeedPetWithFoodPayload extends FoodEventBasePayload {
    petId: string
    foodType: string
    quantity: number
}

// Response event payloads
export interface FoodResponseBasePayload {
    client: Client
    sessionId: string
}

export interface PurchaseFoodResponsePayload extends FoodResponseBasePayload {
    result: import("./food.results").PurchaseFoodResult
}

export interface GetCatalogResponsePayload extends FoodResponseBasePayload {
    result: import("./food.results").GetCatalogResult
}

export interface GetFoodInventoryResponsePayload extends FoodResponseBasePayload {
    result: import("./food.results").GetFoodInventoryResult
}

export interface FeedPetWithFoodResponsePayload extends FoodResponseBasePayload {
    result: import("./food.results").FeedPetWithFoodResult
}

export type AnyFoodEventPayload =
    | PurchaseFoodPayload
    | GetCatalogPayload
    | GetFoodInventoryPayload
    | FeedPetWithFoodPayload
