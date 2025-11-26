import { GraphQLTypePetId, PetId } from "@modules/databases/mongodb/game/enums"
import { Field, Int, ObjectType } from "@nestjs/graphql"

@ObjectType({
    description: "Default configuration for new users",
})
export class DefaultInfoSchema {
    @Field(() => Int, {
        description: "Default starting token NOMamount",
    })
    tokenNom: number

    @Field(() => GraphQLTypePetId, {
        description: "Default pet ID given to new users",
    })
    defaultPetId: PetId
}
