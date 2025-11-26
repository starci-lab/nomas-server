import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { AuthService } from "./auth.service"
import {
    RequestColyseusEphemeralJwtInput,
    RequestColyseusEphemeralJwtResponse,
    RequestColyseusEphemeralJwtResponseData,
    RequestSignatureInput,
    RequestSignatureResponse,
    RequestSignatureResponseData,
} from "./auth.dto"
import { ThrottlerConfig, UseThrottler } from "@modules/throttler"
import { GraphQLSuccessMessage } from "../../../interceptors"
import { GraphQLTransformInterceptor } from "../../../interceptors"
import { UseGuards, UseInterceptors } from "@nestjs/common"
import { GraphQLSignatureGuard } from "@modules/passport"
import { VerifyMessageInput, VerifyMessageResponse } from "@modules/graphql/mutations/game/auth/dto"

@Resolver()
export class AuthResolvers {
    constructor(private readonly authService: AuthService) {}

    @UseThrottler(ThrottlerConfig.Strict)
    @GraphQLSuccessMessage("Colyseus ephemeral JWT requested successfully")
    @UseInterceptors(GraphQLTransformInterceptor)
    @UseGuards(GraphQLSignatureGuard)
    @Mutation(() => RequestColyseusEphemeralJwtResponse)
    async requestColyseusEphemeralJwt(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Args("input") _: RequestColyseusEphemeralJwtInput,
    ): Promise<RequestColyseusEphemeralJwtResponseData> {
        return await this.authService.requestColyseusEphemeralJwt()
    }

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("Signature requested successfully")
    @UseInterceptors(GraphQLTransformInterceptor)
    @Mutation(() => RequestSignatureResponse)
    async requestSignature(@Args("input") input: RequestSignatureInput): Promise<RequestSignatureResponseData> {
        return await this.authService.requestSignature(input)
    }

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("Message verified successfully")
    @UseInterceptors(GraphQLTransformInterceptor)
    @Mutation(() => VerifyMessageResponse)
    public async verifyMessage(@Args("input") input: VerifyMessageInput) {
        return await this.authService.verifyMessage(input)
    }
}
