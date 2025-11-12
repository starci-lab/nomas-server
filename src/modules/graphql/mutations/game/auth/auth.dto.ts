import { AbstractGraphQLResponse, IAbstractGraphQLResponse } from "../../../common"
import { AbstractSignatureInput } from "../../../common"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IsEnum, IsJWT, IsString } from "class-validator"
import { GraphQLTypePlatform, Platform } from "@typedefs"

@InputType({
    isAbstract: true
})
export class RequestColyseusEphemeralJwtInput extends AbstractSignatureInput {
}

/**
 * GraphQL response type for the request colyseus session ID query.
 */
@ObjectType({
    description: "GraphQL response object for requesting a colyseus ephemeral JWT.",
})
export class RequestColyseusEphemeralJwtResponseData 
{
    @Field(() => String, {
        nullable: true,
        description: "The colyseus ephemeral JWT, if the request is successful.",
    })
    @IsJWT()
        jwt: string
}
/**
 * GraphQL response type for the request colyseus ephemeral JWT query.
 */
@ObjectType({
    description: "GraphQL response object for requesting a colyseus ephemeral JWT.",
})
export class RequestColyseusEphemeralJwtResponse 
    extends AbstractGraphQLResponse
    implements IAbstractGraphQLResponse<RequestColyseusEphemeralJwtResponseData>
{
    @Field(() => RequestColyseusEphemeralJwtResponseData, {
        nullable: true,
        description: "The colyseus ephemeral JWT, if the request is successful.",
    })
        data?: RequestColyseusEphemeralJwtResponseData
}

@InputType({
    description: "Input for requesting a signed message for a given platform."
})
export class RequestSignatureInput {
    @Field(() => GraphQLTypePlatform, {
        nullable: true,
        description: "The platform to sign the message for. Optional if default platform is used."
    })
    @IsEnum(Platform)
        platform: Platform
}

@ObjectType({
    description: "Response object containing the signed message and related cryptographic information."
})
export class RequestSignatureResponseData {
    @Field(() => String, {
        description: "The signature of the message, if the request is successful."
    })
    @IsJWT()
        signature: string

    @Field(() => String, {
        description: "The original message that was signed."
    })
    @IsString()
        message: string

    @Field(() => String, {
        description: "The public key used to sign the message."
    })
    @IsString()
        publicKey: string

    @Field(() => String, {
        description: "The account address associated with the signature."
    })
    @IsString()
        accountAddress: string
}

@ObjectType({
    description: "GraphQL response object for requesting a signed message.",
})
export class RequestSignatureResponse 
    extends AbstractGraphQLResponse
    implements IAbstractGraphQLResponse<RequestSignatureResponseData>
{
    @Field(() => RequestSignatureResponseData, {
        description: "The signed message and related cryptographic information, if the request is successful.",
    })
        data: RequestSignatureResponseData
}