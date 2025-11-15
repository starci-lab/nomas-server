export enum GameActionResponseMessage {
    Purchase = "purchase_response",
    BuyFood = "buy_food_response",
    RemovePet = "remove_pet_response",
    BuyPet = "buy_pet_response",
    CleanedPet = "cleaned_pet_response",
    CreatePoop = "create_poop_response",
}

export interface ActionResponsePayload
<Payload extends Record<string, unknown>> 
{
    success: boolean
    error?: string
    message: GameActionResponseMessage
    data?: Payload
}