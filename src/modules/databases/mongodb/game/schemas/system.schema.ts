import { GraphQLTypePetId, GraphQLTypePetName, GraphQLTypeSystemId, PetId, PetName, SystemId } from "../enums"
import { AbstractSchema } from "./abstract"
import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@ObjectType({
    description: "The system schema",
})
@Schema({
    timestamps: true,
    collection: "systems",
})
export class SystemSchema extends AbstractSchema {
    @Field(() => GraphQLTypeSystemId, {
        description: "The display ID of the system",
    })
    @Prop({ type: String, enum: SystemId, required: true, unique: true })
    displayId: SystemId

    @Field(() => JSON, {
        description: "The system configuration value",
    })
    @Prop({ type: Object, required: true })
    value: object
}

@ObjectType({
    description: "Default configuration for new users",
})
@Schema({
    timestamps: true,
    collection: "default-info",
})
export class DefaultInfoSchema {
    @Field(() => Int, {
        description: "Default starting token NOMamount",
    })
    @Prop({ type: Number, required: true, default: 10000 })
    tokenNom: number

    @Field(() => GraphQLTypePetId, {
        description: "Default pet ID given to new users",
    })
    @Prop({ type: String, enum: PetId, required: true, default: PetId.Chog })
    defaultPetId: PetId

    @Field(() => GraphQLTypePetName, {
        description: "Default pet name given to new users",
    })
    @Prop({ type: String, enum: PetName, required: true, default: PetName.Chog })
    defaultPetName: PetName
}

export const SystemSchemaClass = SchemaFactory.createForClass(SystemSchema)
