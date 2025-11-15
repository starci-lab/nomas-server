import { ObjectType, Field } from "@nestjs/graphql"
import { PetSchema, StoreItemSchema } from "@modules/databases"
import { AbstractGraphQLResponse, IAbstractGraphQLResponse } from "../../../common"

/**
 * GraphQL response type for the pets query.
 */
@ObjectType({
    description: "GraphQL response object for fetching pets.",
})
export class PetsResponse extends AbstractGraphQLResponse implements IAbstractGraphQLResponse<Array<PetSchema>> {
    @Field(() => [PetSchema], {
        description: "List of pets returned by the query.",
    })
    data: Array<PetSchema>
}

/**
 * GraphQL response type for the liquidity pools query.
 */
@ObjectType({
    description: "GraphQL response object for fetching liquidity pools.",
})
export class StoreItemsResponse
    extends AbstractGraphQLResponse
    implements IAbstractGraphQLResponse<Array<StoreItemSchema>>
{
    @Field(() => [StoreItemSchema], {
        description: "List of liquidity pools returned by the query.",
    })
    data: Array<StoreItemSchema>
}
