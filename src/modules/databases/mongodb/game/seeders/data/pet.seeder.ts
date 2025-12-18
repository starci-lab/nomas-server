import { Injectable, Logger } from "@nestjs/common"
import { PetSchema } from "../../schemas"
import { DeepPartial } from "@typedefs"
import { Connection } from "mongoose"
import { InjectGameMongoose } from "../../decorators"
import { Seeder } from "nestjs-seeder"
import { SeederException } from "@exceptions"
import { PetId } from "../../enums"
import { createObjectId } from "@utils"

const data: Array<DeepPartial<PetSchema>> = [
    {
        _id: createObjectId(PetId.Chog),
        displayId: PetId.Chog,
        name: "Chog",
        description: "A cute starter pet",
        defaultHappiness: 90,
        defaultHunger: 90,
        defaultCleanliness: 90,
        happinessDecayMin: 1,
        happinessDecayMax: 2,
        hungerDecayMin: 2,
        hungerDecayMax: 3,
        cleanlinessDecayMin: 1,
        cleanlinessDecayMax: 2,
        costNom: 50,
        timeNatural: 10,
        maxIncome: 100,
        incomePerClaim: 1,
        maxIncomePerClaim: 15,
    },
    {
        _id: createObjectId(PetId.KeoneDog),
        displayId: PetId.KeoneDog,
        name: "KeoneDog",
        description:
            "A small purple-blue dog with pointed ears and bright eyes. It idles, walks, sleeps, and chews as your loyal companion.",
        defaultHappiness: 90,
        defaultHunger: 85,
        defaultCleanliness: 95,
        happinessDecayMin: 1,
        happinessDecayMax: 2,
        hungerDecayMin: 1,
        hungerDecayMax: 2,
        cleanlinessDecayMin: 1,
        cleanlinessDecayMax: 2,

        costNom: 60,
        timeNatural: 5,
        maxIncome: 120,
        incomePerClaim: 2,
        maxIncomePerClaim: 20,
    },
    {
        _id: createObjectId(PetId.Ghost),
        displayId: PetId.Ghost,
        name: "Ghost",
        description: "A cute starter pet with loyal nature",

        defaultHappiness: 90,
        defaultHunger: 85,
        defaultCleanliness: 95,

        happinessDecayMin: 1,
        happinessDecayMax: 2,
        hungerDecayMin: 1,
        hungerDecayMax: 2,
        cleanlinessDecayMin: 1,
        cleanlinessDecayMax: 2,

        costNom: 70,
        timeNatural: 10,
        maxIncome: 100,
        incomePerClaim: 1,
        maxIncomePerClaim: 15,
    },
    {
        _id: createObjectId(PetId.Zombie),
        displayId: PetId.Zombie,
        name: "Zombie",
        description: "Zombie pet from city pet",

        defaultHappiness: 90,
        defaultHunger: 85,
        defaultCleanliness: 95,

        happinessDecayMin: 1,
        happinessDecayMax: 2,
        hungerDecayMin: 1,
        hungerDecayMax: 2,
        cleanlinessDecayMin: 1,
        cleanlinessDecayMax: 2,

        costNom: 100,
        timeNatural: 10,
        maxIncome: 100,
        incomePerClaim: 1,
        maxIncomePerClaim: 15,
    },
    {
        _id: createObjectId(PetId.Bird),
        displayId: PetId.Bird,
        name: "Bird",
        description: "Bird pet from city pet",
        defaultHappiness: 90,
        defaultHunger: 85,
        defaultCleanliness: 95,

        happinessDecayMin: 1,
        happinessDecayMax: 2,
        hungerDecayMin: 1,
        hungerDecayMax: 2,
        cleanlinessDecayMin: 1,
        cleanlinessDecayMax: 2,

        costNom: 100,
        timeNatural: 10,
        maxIncome: 100,
        incomePerClaim: 1,
        maxIncomePerClaim: 15,
    },
]

@Injectable()
export class PetSeeder implements Seeder {
    private readonly logger = new Logger(PetSeeder.name)

    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    public async seed(): Promise<void> {
        await this.drop()
        await this.connection.model<PetSchema>(PetSchema.name).create(data)
    }

    async drop(): Promise<void> {
        try {
            await this.connection.model<PetSchema>(PetSchema.name).deleteMany({})
        } catch (error) {
            this.logger.debug(error)
            throw new SeederException("Failed to drop pets")
        }
    }
}
