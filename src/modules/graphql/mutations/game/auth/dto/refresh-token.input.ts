import { InputType, Field } from "@nestjs/graphql"
import { IsNotEmpty, IsString } from "class-validator"

@InputType()
export class RefreshTokenInput {
    @Field(() => String, { description: "Refresh token to refresh" })
    @IsString()
    @IsNotEmpty()
        refreshToken: string
}
