import { Field, ObjectType, Float, ID, Int } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Types } from "mongoose"
import { UserSchema } from "./user.schema"
import { StoreItemSchema } from "@modules/databases/mongodb/game/schemas/store-item.schema"
import { GraphQLTypeInventoryKind, InventoryKind } from "@modules/databases/mongodb/game/enums"

@ObjectType()
class PositionSchema {
    @Field(() => Float)
    @Prop({ type: Number, required: false, nullable: true })
    x?: number

    @Field(() => Float)
    @Prop({ type: Number, required: false, nullable: true })
    y?: number
}

@Schema({ timestamps: true, collection: "inventories" })
@ObjectType({
    description:
        "Represents a player's inventory. Each inventory item has a specific effect on pet stats or the player's environment.",
})
export class InventorySchema extends AbstractSchema {
    @Field(() => ID, {
        description: "The unique identifier of the user who owns this inventory.",
    })
    @Prop({
        type: Types.ObjectId,
        ref: UserSchema.name,
        required: true,
    })
    user: UserSchema | Types.ObjectId

    @Field(() => ID, {
        description: "Reference to the store item that is in the inventory.",
    })
    @Prop({ type: Types.ObjectId, ref: StoreItemSchema.name, required: true })
    storeItem: StoreItemSchema | Types.ObjectId

    @Field(() => GraphQLTypeInventoryKind, {
        description: "The kind of inventory item.",
    })
    @Prop({
        type: String,
        enum: InventoryKind,
        required: true,
    })
    kind: InventoryKind

    @Field(() => Int, {
        description: "The quantity of the inventory item.",
    })
    @Prop({
        type: Number,
        required: false,
        nullable: true,
    })
    quantity?: number

    @Field(() => PositionSchema, {
        description: "The position of the inventory item.",
    })
    @Prop({
        type: PositionSchema,
        required: false,
        nullable: true,
    })
    position?: PositionSchema
}

export const InventorySchemaClass = SchemaFactory.createForClass(InventorySchema)
