import { Client } from "colyseus"
import { PetColyseusSchema, PlayerColyseusSchema } from "@modules/colyseus/schemas"
import {
    SendBuyPetResponsePayload,
    SendRemovePetResponsePayload,
    SendCleanedPetResponsePayload,
    SendCreatePoopResponsePayload,
    SendActionResponsePayload,
    SendPetsStateSyncPayload,
} from "@modules/colyseus/events"

// Type for sender room methods
export type SenderRoom = {
    sendBuyPetResponse: (client: Client, payload: SendBuyPetResponsePayload) => void
    sendRemovePetResponse: (client: Client, payload: SendRemovePetResponsePayload) => void
    sendCleanedPetResponse: (client: Client, payload: SendCleanedPetResponsePayload) => void
    sendCreatePoopResponse: (client: Client, payload: SendCreatePoopResponsePayload) => void
    sendActionResponse: (client: Client, payload: SendActionResponsePayload) => void
    sendPetsStateSync: (client: Client, payload: SendPetsStateSyncPayload) => void
}

// Type for state room methods
export type StateRoom = {
    createPetState: (petId: string, ownerId: string, petType?: string) => PetColyseusSchema
    addPetToState: (pet: PetColyseusSchema, player: PlayerColyseusSchema) => void
    removePetFromState: (petId: string, player: PlayerColyseusSchema) => boolean
    feedPetState: (pet: PetColyseusSchema, foodValue?: number) => void
    playWithPetState: (pet: PetColyseusSchema, playValue?: number) => void
    cleanPetState: (pet: PetColyseusSchema, cleanValue?: number) => void
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
