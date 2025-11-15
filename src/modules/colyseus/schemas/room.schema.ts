import { MapSchema, Schema, type } from "@colyseus/schema"
import { PlayerColyseusSchema } from "./player.schema"
import { PetColyseusSchema } from "./pet.schema"

export class GameRoomColyseusSchema extends Schema {
    @type({ map: PlayerColyseusSchema }) players: MapSchema<PlayerColyseusSchema> = new MapSchema<PlayerColyseusSchema>()
    @type({ map: PetColyseusSchema }) pets: MapSchema<PetColyseusSchema> = new MapSchema<PetColyseusSchema>()
    @type("string") roomName: string = "Pet Simulator Room"
    @type("number") playerCount: number = 0
    @type("number") createdAt: number = 0

    constructor() {
        super()
        this.createdAt = Date.now()
    }
}
