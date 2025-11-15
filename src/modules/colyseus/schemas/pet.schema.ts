import { Schema, type } from "@colyseus/schema"
import { PoopColyseusSchema } from "./poop.schema"

export class PetColyseusSchema extends Schema {
    @type("string") id: string = ""
    @type("string") ownerId: string = ""
    @type("string") petType: string = "chog" // Pet species/type

    // Core stats
    @type("number") hunger: number = 100 // 0-100, decreases over time
    @type("number") happiness: number = 100 // 0-100, affected by feeding, playing
    @type("number") cleanliness: number = 100 // 0-100, decreases over time
    @type("number") lastUpdated: number = 0 // For tracking stat decay

    @type("string") lastUpdateHappiness: string = "" // For tracking last fed time
    @type("string") lastUpdateHunger: string = "" // For tracking last fed time
    @type("string") lastUpdateCleanliness: string = "" // For tracking last fed time

    // Growth tracking
    @type("boolean") isAdult: boolean = false
    @type("string") birthTime: string = "" // when pet is created
    @type("number") growthDuration: number = 3600 // time to grow up

    // Income cycle
    @type("number") incomeCycleTime: number = 600 // earn cycle (seconds)
    @type("number") incomePerCycle: number = 10 // max token / cycle
    @type("string") lastClaim: string = "" // last claim

    @type({ array: PoopColyseusSchema }) poops: Array<PoopColyseusSchema> = []
    
    constructor() {
        super()
        this.lastUpdated = Date.now()
    }
}