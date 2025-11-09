import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Field, ObjectType } from "@nestjs/graphql"
import { GraphQLTypePlatform, Platform } from "@typedefs"

@Schema({
    timestamps: true,
    collection: "users",
})
@ObjectType({
    description:
        "Represents a player in the game ecosystem. Each user is linked to a blockchain wallet that defines their in-game ownership, assets, and identity across different chains.",
})
export class UserSchema extends AbstractSchema {
    @Field(() => GraphQLTypePlatform, {
        description:
            "The blockchain network where the player's wallet resides. Determines how the game verifies ownership and processes on-chain actions.",
        nullable: true,
    })
    @Prop({ type: String, enum: Platform, required: false })
        platform?: Platform

    @Field(() => String, {
        description:
            "The player's wallet address used to authenticate and manage their in-game assets or progress on the corresponding blockchain.",
        nullable: true,
    })
    @Prop({ type: String, required: false })
        accountAddress?: string
}

export const UserSchemaClass = SchemaFactory.createForClass(UserSchema)