import { AbstractGraphQLResponse, IAbstractGraphQLResponse } from "@modules/graphql/common"
import { VerifyMessageResponseData } from "./verify-mesage.res.dto"
import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType({
    description: "Authentication credentials returned after successful message verification.",
})
export class RefreshTokenResponseData extends VerifyMessageResponseData {}

@ObjectType()
export class RefreshTokenResponse
    extends AbstractGraphQLResponse
    implements IAbstractGraphQLResponse<RefreshTokenResponseData>
{
    @Field(() => RefreshTokenResponseData, { description: "Data of the response" })
        data: RefreshTokenResponseData
}
