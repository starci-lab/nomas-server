export const GamePetMessages = {
    BUY_PET: "buy_pet",
    REMOVE_PET: "remove_pet",
    BUY_FOOD: "buy_food",
    FEED_PET: "feed_pet",
    PLAY_WITH_PET: "play_with_pet",
    FOOD_CONSUMED: "eated_food",
    CLEANED_PET: "cleaned_pet",
    PLAYED_PET: "played_pet",
    STATE_SYNC: "pets_state_sync",
    CREATE_POOP: "create_poop",
} as const

export const GameActionMessages = {
    RESPONSE: "action_response",
    PURCHASE_RESPONSE: "purchase_response",
    BUY_FOOD_RESPONSE: "buy_food_response",
    REMOVE_PET_RESPONSE: "remove_pet_response",
    BUY_PET_RESPONSE: "buy_pet_response",
    CLEANED_PET_RESPONSE: "cleaned_pet_response",
    CREATE_POOP_RESPONSE: "create_poop_response",
} as const

export const DEFAULT_PET_PRICE = 50
