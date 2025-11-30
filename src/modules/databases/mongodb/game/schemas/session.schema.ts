import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { UserSchema } from "./user.schema"

export type SessionDocument = HydratedDocument<SessionSchema>

@ObjectType({
    description: "The schema for user sessions",
})
@Schema({
    timestamps: true,
    collection: "sessions",
})
export class SessionSchema extends AbstractSchema {
    @Field(() => String, {
        description: "The hash of the session",
    })
    @Prop({ type: String, required: true, unique: true })
        hash!: string

    @Field(() => ID, {
        description: "The user associated with this session",
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user!: UserSchema | Types.ObjectId
}

export const SessionSchemaClass = SchemaFactory.createForClass(SessionSchema)
