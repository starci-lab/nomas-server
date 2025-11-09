import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop } from "@nestjs/mongoose"
import { Document } from "mongoose"

@ObjectType({
    isAbstract: true,
    description: "The abstract schema for all objects"
})
export abstract class AbstractSchema extends Document {
    // field to use graphql
    @Field(() => ID, {
        description: "The ID of the object"
    })
    declare id: string

    @Prop()
    @Field(() => Date, {
        description: "The date the object was created"

    })
        createdAt: Date

    @Prop()
    @Field(() => Date, {
        description: "The date the object was updated"
    })
        updatedAt: Date

    @Prop({
        type: Date,
        index: { expires: 0 }, // TTL index, will delete the document after the expiration time
        required: false,
    })
        expiredAt?: Date

    // version to ensure optimistic locking
    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    @Field(() => Number, {
        description: "The version of the object"
    })
        version: number
}