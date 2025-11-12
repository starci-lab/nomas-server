import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypePlatform, Platform } from "@typedefs"
import { IsBoolean, IsEnum, IsString } from "class-validator"

// Define an abstract input type that can be extended by other input types
@InputType({
    isAbstract: true
})
export abstract class AbstractSignatureInput {
    @Field(() => String, {
        description: "The user's public key, used to verify the digital signature."
    })
    @IsString()
        publicKey: string

    @Field(() => String, {
        description: "The user's account address associated with their public key."
    })
    @IsString()
        accountAddress: string

    @Field(() => String, {
        description: "The digital signature generated from the message using the user's private key."
    })
    @IsString()
        signature: string

    @Field(() => String, {
        description: "The original message that was signed to verify the user's identity or action."
    })
    @IsString()
        message: string

    @Field(() => GraphQLTypePlatform, {
        description: "The platform of the user."
    })
    @IsEnum(Platform)
    @IsString()
        platform: Platform
}

@ObjectType({
    isAbstract: true,
    description: "The base response for all GraphQL queries and mutations.",
})
export abstract class AbstractGraphQLResponse {
    @IsBoolean()
    @Field(() => Boolean, {
        description: "The success of the response.",
    })
        success: boolean

    @IsString()
    @Field(() => String, {
        description: "The message of the response.",
    })
        message: string

    @IsString()
    @Field(() => String, {
        nullable: true,
        description: "The error of the response.",
    })
        error?: string
}

export interface IAbstractGraphQLResponse<T = undefined> {
    success: boolean
    message: string
    data?: T
    error?: string
}