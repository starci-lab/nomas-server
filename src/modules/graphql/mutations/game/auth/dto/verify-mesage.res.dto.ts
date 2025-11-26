import { InputType, Field } from "@nestjs/graphql"
import { IsNotEmpty, IsString } from "class-validator"

@InputType()
export class VerifyMessageResponse {
    @Field(() => String, { description: "Message to verify signature" })
    @IsString()
    @IsNotEmpty()
    message: string
}
