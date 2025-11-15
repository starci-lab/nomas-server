import { MapSchema, Schema, type } from "@colyseus/schema"
import { InventoryItemColyseusSchema } from "./inventory-item.schema"
import { PetColyseusSchema } from "./pet.schema"

export class PlayerColyseusSchema extends Schema {
    @type("string") sessionId: string = ""
    @type("string") walletAddress: string = ""
    @type("number") tokens: number = 100 // Game currency
    @type("number") totalPetsOwned: number = 0 // Count of pets owned
    @type({ map: InventoryItemColyseusSchema }) inventory: MapSchema<InventoryItemColyseusSchema> = new MapSchema<InventoryItemColyseusSchema>()
    @type({ map: PetColyseusSchema }) pets: MapSchema<PetColyseusSchema> = new MapSchema<PetColyseusSchema>() // Player's pets collection
    @type("number") joinedAt: number = 0

    constructor() {
        super()
        this.joinedAt = Date.now()
    }
}
