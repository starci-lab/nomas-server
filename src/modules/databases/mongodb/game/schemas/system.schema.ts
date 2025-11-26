import { GraphQLTypePetId, PetId } from "@modules/databases/mongodb/game/enums"
import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

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
}

export const DefaultInfoSchemaClass = SchemaFactory.createForClass(DefaultInfoSchema)
