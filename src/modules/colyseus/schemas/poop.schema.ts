import { Schema, type } from "@colyseus/schema"

// Poop schema
export class PoopColyseusSchema extends Schema {
    @type("string") id: string = ""
    @type("string") petId: string = ""
    @type("number") positionX: number = 0
    @type("number") positionY: number = 0
}
