export enum GameActionReceiveMessage {
    BuyPet = "buy_pet",
}

export interface ReceiveBuyPetPayload {
    petType?: string
    petTypeId?: string
    isBuyPet?: boolean
}