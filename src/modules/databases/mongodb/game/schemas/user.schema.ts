import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Field, Int, ObjectType } from "@nestjs/graphql"
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
    @Prop({ type: String, enum: Platform, required: true, default: Platform.Evm })
        platform: Platform

    @Field(() => Int, {
        description: "The amount of NOM tokens the player has.",
        nullable: true,
    })
    @Prop({ type: Number, required: true, default: 10000 })
        tokenNom: number

    @Field(() => String, {
        description:
            "The player's wallet address used to authenticate and manage their in-game assets or progress on the corresponding blockchain.",
        nullable: true,
    })
    @Prop({ type: String, required: true })
        accountAddress: string
}

export const UserSchemaClass = SchemaFactory.createForClass(UserSchema)
