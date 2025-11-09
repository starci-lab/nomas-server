import { Field, Float, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { GraphQLTypePetId, PetId } from "../enums"

@Schema({ timestamps: true, collection: "pets" })
@ObjectType({
    description:
        "Defines the base attributes and configuration of a pet species in the game. Each pet determines its starting stats, stat decay behavior, and income potential.",
})
export class PetSchema extends AbstractSchema {
    @Field(() => GraphQLTypePetId, {
        description: "The ID of the pet",
    })
    @Prop({ type: String, enum: PetId, required: true })
        displayId: PetId
    
    @Field(() => String, {
        description: "Unique name of the pet species (e.g., Crab, Doge, Axolotl).",
    })
    @Prop({ type: String, required: true, unique: true })
        name: string

    @Field(() => String, {
        description: "A short description or lore about this pet species.",
        nullable: true,
    })
    @Prop({ type: String, required: false })
        description?: string

    // Default Stats
    @Field(() => Float, {
        description: "Default happiness stat when a new pet of this type is created.",
    })
    @Prop({ type: Number, required: true, default: 100 })
        defaultHappiness: number

    @Field(() => Float, {
        description: "Default hunger stat when a new pet of this type is created.",
    })
    @Prop({ type: Number, required: true, default: 100 })
        defaultHunger: number

    @Field(() => Float, {
        description: "Default cleanliness stat when a new pet of this type is created.",
    })
    @Prop({ type: Number, required: true, default: 100 })
        defaultCleanliness: number

    // Stat decay rates
    @Field(() => Float, {
        description: "Minimum happiness decay rate per tick.",
    })
    @Prop({ type: Number, required: true, default: 1 })
        happinessDecayMin: number

    @Field(() => Float, {
        description: "Maximum happiness decay rate per tick.",
    })
    @Prop({ type: Number, required: true, default: 2 })
        happinessDecayMax: number

    @Field(() => Float, {
        description: "Minimum hunger decay rate per tick.",
    })
    @Prop({ type: Number, required: true, default: 2 })
        hungerDecayMin: number

    @Field(() => Float, {
        description: "Maximum hunger decay rate per tick.",
    })
    @Prop({ type: Number, required: true, default: 3 })
        hungerDecayMax: number

    @Field(() => Float, {
        description: "Minimum cleanliness decay rate per tick.",
    })
    @Prop({ type: Number, required: true, default: 1 })
        cleanlinessDecayMin: number

    @Field(() => Float, {
        description: "Maximum cleanliness decay rate per tick.",
    })
    @Prop({ type: Number, required: true, default: 2 })
        cleanlinessDecayMax: number

    // Economy and lifecycle
    @Field(() => Float, {
        description: "Cost (in NOM or in-game currency) to purchase this pet.",
    })
    @Prop({ type: Number, required: true, default: 100 })
        costNom: number

    @Field(() => Float, {
        description: "The natural lifetime or duration this pet type remains productive.",
    })
    @Prop({ type: Number, required: true, default: 2 })
        timeNatural: number

    @Field(() => Float, {
        description: "Maximum cumulative token income this pet type can generate.",
    })
    @Prop({ type: Number, required: true, default: 100 })
        maxIncome: number

    @Field(() => Float, {
        description: "Base token income earned per claim cycle.",
    })
    @Prop({ type: Number, required: true, default: 5 })
        incomePerClaim: number

    @Field(() => Float, {
        description: "Maximum possible token income per claim (affected by happiness).",
    })
    @Prop({ type: Number, required: true, default: 15 })
        maxIncomePerClaim: number
}

export const PetSchemaClass = SchemaFactory.createForClass(PetSchema)