import type { Client } from "colyseus"
import type { GameRoom } from "@modules/colyseus/rooms/game.room"

export enum GameFoodEvent {
    PurchaseRequested = "game.food.purchaseRequested",
    GetCatalogRequested = "game.food.getCatalogRequested",
    GetInventoryRequested = "game.food.getInventoryRequested",
    FeedPetRequested = "game.food.feedPetRequested",
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

export type AnyFoodEventPayload =
    | PurchaseFoodPayload
    | GetCatalogPayload
    | GetFoodInventoryPayload
    | FeedPetWithFoodPayload
