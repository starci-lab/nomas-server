import { PetColyseusSchema } from "@modules/colyseus/schemas"

// Type for state room methods
export type StateRoom = {
    feedPetState: (pet: PetColyseusSchema, foodValue?: number) => void
    getPetStatsSummary: (pet: PetColyseusSchema) => {
        id: string
        petType: string
        hunger: number
        happiness: number
        cleanliness: number
        overallHealth: number
        lastUpdated: number
        poops: Array<{ id: string; petId: string; positionX: number; positionY: number }>
    }
}

export interface FoodItems {
    [key: string]: {
        price: number
        nutrition: number
        name: string
    }
}

export interface InventorySummary {
    totalItems: number
    itemsByType: Record<string, number>
    items: Array<{
        type: string
        id: string
        name: string
        quantity: number
        totalPurchased: number
    }>
}
