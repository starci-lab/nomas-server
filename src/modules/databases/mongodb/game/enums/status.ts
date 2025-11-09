import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@utils"

export enum PetStatus {
    Active = "active",
    Exhausted = "exhausted"
    }

export const GraphQLTypePetStatus = createEnumType(PetStatus)
registerEnumType(GraphQLTypePetStatus, {
    name: "PetStatus",
    description: "The status of the pet",
    valuesMap: {
        [PetStatus.Active]: { description: "The pet is active" },
        [PetStatus.Exhausted]: { description: "The pet is exhausted" },
    },
})