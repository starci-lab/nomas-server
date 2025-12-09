import { Injectable, Logger } from "@nestjs/common"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"
import { SeederException } from "@exceptions"
import { InjectGameMongoose } from "../../decorators"
import { StoreItemId, StoreItemType } from "../../enums"
import { StoreItemSchema } from "../../schemas"
import { DeepPartial } from "@typedefs"
import { createObjectId } from "@utils"

const data: Array<DeepPartial<StoreItemSchema>> = [
    {
        _id: createObjectId(StoreItemId.Ball),
        displayId: StoreItemId.Ball,
        name: "Ball",
        type: StoreItemType.Toy,
        description: "Toys for pet",
        costNom: 50,
        effectHunger: 0,
        effectHappiness: 30,
        effectCleanliness: 0,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Sky),
        displayId: StoreItemId.Sky,
        name: "Sky",
        type: StoreItemType.Background,
        description: "Sky background",
        costNom: 100,
        effectHunger: 0,
        effectHappiness: 0,
        effectCleanliness: 0,
        effectDuration: 0,
    },
    {
        _id: createObjectId(StoreItemId.City),
        displayId: StoreItemId.City,
        name: "City",
        type: StoreItemType.Background,
        description: "City background",
        costNom: 2000,
        effectHunger: 0,
        effectHappiness: 0,
        effectCleanliness: 0,
        effectDuration: 0,
    },
    {
        _id: createObjectId(StoreItemId.Apple),
        displayId: StoreItemId.Apple,
        name: "Apple",
        type: StoreItemType.Food,
        description: "Pet food apple",
        costNom: 60,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Cake),
        displayId: StoreItemId.Cake,
        name: "Cake",
        type: StoreItemType.Food,
        description: "Pet food cake",
        costNom: 70,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Coke),
        displayId: StoreItemId.Coke,
        name: "Coke",
        type: StoreItemType.Food,
        description: "Pet food coke",
        costNom: 70,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.IceCream),
        displayId: StoreItemId.IceCream,
        name: "Ice cream",
        type: StoreItemType.Food,
        description: "Pet food icecream",
        costNom: 70,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Watermelon),
        displayId: StoreItemId.Watermelon,
        name: "Watermelon",
        type: StoreItemType.Food,
        description: "Pet food watermelon",
        costNom: 40,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Bone),
        displayId: StoreItemId.Bone,
        name: "Bone",
        type: StoreItemType.Food,
        description: "Pet food bone",
        costNom: 50,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Daruma),
        displayId: StoreItemId.Daruma,
        name: "Daruma",
        type: StoreItemType.Toy,
        description: "Pet toy daruma",
        costNom: 50,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Football),
        displayId: StoreItemId.Football,
        name: "Football",
        type: StoreItemType.Toy,
        description: "Pet toy football",
        costNom: 60,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Game),
        displayId: StoreItemId.Game,
        name: "Game",
        type: StoreItemType.Toy,
        description: "Pet toy game console",
        costNom: 80,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Tedy),
        displayId: StoreItemId.Tedy,
        name: "Tedy",
        type: StoreItemType.Toy,
        description: "Pet teddy toy",
        costNom: 80,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
    {
        _id: createObjectId(StoreItemId.Broom),
        displayId: StoreItemId.Broom,
        name: "Broom",
        type: StoreItemType.Clean,
        description: "High-quality pet cleaning tool that increases cleanliness satisfaction",
        costNom: 50,
        effectHunger: 20,
        effectHappiness: 15,
        effectCleanliness: 10,
        effectDuration: 60,
    },
]

@Injectable()
export class StoreItemSeeder implements Seeder {
    private readonly logger = new Logger(StoreItemSeeder.name)

    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    public async seed(): Promise<void> {
        await this.drop()
        await this.connection.model<StoreItemSchema>(StoreItemSchema.name).create(data)
    }

    async drop(): Promise<void> {
        try {
            await this.connection.model<StoreItemSchema>(StoreItemSchema.name).deleteMany({})
        } catch {
            throw new SeederException("Failed to drop store items")
        }
    }
}
