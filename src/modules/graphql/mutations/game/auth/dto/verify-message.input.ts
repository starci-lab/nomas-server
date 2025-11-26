import { InputType, Field } from "@nestjs/graphql"
import { Platform } from "@typedefs"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"

@InputType()
export class VerifyMessageInput {
    @Field(() => String, { description: "Message to verify signature" })
    @IsString()
    @IsNotEmpty()
    message: string

    @Field(() => String, { description: "Address to verify signature" })
    @IsString()
    @IsNotEmpty()
    address: string

    @Field(() => String, { description: "Signed message from the message" })
    @IsString()
    @IsNotEmpty()
    signedMessage: string

    @Field(() => Platform, { description: "Platform used to verify signature", defaultValue: Platform.Evm })
    @IsEnum(Platform)
    @IsOptional()
    platform: Platform = Platform.Evm
}
