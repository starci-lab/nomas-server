import { Field, ObjectType, Float } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@Schema({ autoCreate: false, timestamps: true })
@ObjectType({
    description:
        "Represents a poop object created by a pet in the game world. Each poop has a reference to its owner (pet) and a position on the game map.",
})
export class PoopSchema extends AbstractSchema {
    @Field(() => Float, {
        description: "Horizontal position of the poop on the game map (X coordinate).",
    })
    @Prop({ type: Number, required: true, default: 0 })
        positionX: number

    @Field(() => Float, {
        description: "Vertical position of the poop on the game map (Y coordinate).",
    })
    @Prop({ type: Number, required: true, default: 0 })
        positionY: number
}

export const PoopSchemaClass = SchemaFactory.createForClass(PoopSchema)