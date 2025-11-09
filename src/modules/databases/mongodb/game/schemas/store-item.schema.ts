import { Field, ObjectType, Float } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { GraphQLTypeStoreItemId, GraphQLTypeStoreItemType, StoreItemId, StoreItemType } from "../enums"

@Schema({ timestamps: true, collection: "store-items" })
@ObjectType({
    description:
        "Represents an item available in the in-game store. Each store item has a specific effect on pet stats or the player's environment.",
})
export class StoreItemSchema extends AbstractSchema {
    @Field(() => GraphQLTypeStoreItemId, {
        description: "The ID of the store item",
    })
    @Prop({ type: String, enum: StoreItemId, required: true })
        displayId: StoreItemId
        
    @Field(() => String, {
        description: "Unique display name of the store item.",
    })
    @Prop({
        type: String,
        unique: true,
        required: true,
    })
        name: string

    @Field(() => GraphQLTypeStoreItemType, {
        description:
            "The type or category of the store item (e.g., food, toy, clean, furniture, background, pet).",
    })
    @Prop({
        type: String,
        enum: StoreItemType,
        required: true,
    })
        type: StoreItemType

    @Field(() => String, {
        description: "A short description of what the item does or represents.",
        nullable: true,
    })
    @Prop({
        type: String,
        required: false,
    })
        description?: string

    @Field(() => Float, {
        description:
            "The base cost of the item in NOM tokens or equivalent in-game currency.",
    })
    @Prop({
        type: Number,
        required: true,
        default: 0,
    })
        costNom: number

    // Flatten effect fields instead of using Object type
    @Field(() => Float, {
        description: "The hunger value restored or affected by using this item.",
        nullable: true,
    })
    @Prop({ type: Number, required: false })
        effectHunger?: number

    @Field(() => Float, {
        description: "The happiness value increased by this item.",
        nullable: true,
    })
    @Prop({ type: Number, required: false })
        effectHappiness?: number

    @Field(() => Float, {
        description: "The cleanliness restored or modified by this item.",
        nullable: true,
    })
    @Prop({ type: Number, required: false })
        effectCleanliness?: number

    @Field(() => Float, {
        description: "Optional duration (in seconds) for temporary effects.",
        nullable: true,
    })
    @Prop({ type: Number, required: false })
        effectDuration?: number
}

export const StoreItemSchemaClass = SchemaFactory.createForClass(StoreItemSchema)