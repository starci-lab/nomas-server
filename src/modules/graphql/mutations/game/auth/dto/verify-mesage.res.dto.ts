import { AbstractGraphQLResponse, IAbstractGraphQLResponse } from "@modules/graphql/common"
import { Field, ObjectType } from "@nestjs/graphql"
import { IsDate, IsJWT, IsNotEmpty, IsOptional, IsString } from "class-validator"

@ObjectType({
    description: "Refresh token information returned after successful message verification.",
})
export class VerifyMessageRefreshTokenData {
    @Field(() => String, { description: "Refresh token string." })
    @IsString()
    @IsNotEmpty()
    token: string

    @Field(() => Date, {
        nullable: true,
        description: "Expiration time of the refresh token. Can be null if not configured.",
    })
    @IsDate()
    @IsOptional()
    expiredAt: Date | null
}

@ObjectType({
    description: "Authentication credentials returned after successful message verification.",
})
export class VerifyMessageResponseData {
    @Field(() => String, { description: "Access token for authenticated user." })
    @IsJWT()
    @IsNotEmpty()
    accessToken: string

    @Field(() => VerifyMessageRefreshTokenData, {
        description: "Refresh token payload for renewing access tokens.",
    })
    refreshToken: VerifyMessageRefreshTokenData
}

@ObjectType()
export class VerifyMessageResponse
    extends AbstractGraphQLResponse
    implements IAbstractGraphQLResponse<VerifyMessageResponseData>
{
    @Field(() => VerifyMessageResponseData, { description: "Data of the response" })
    data: VerifyMessageResponseData
}
