import { Args, Mutation, Query, Resolver } from "@nestjs/graphql"
import { AuthService } from "./auth.service"
import {
    RequestColyseusEphemeralJwtInput,
    RequestColyseusEphemeralJwtResponse,
    RequestColyseusEphemeralJwtResponseData,
    RequestMessageInput,
    RequestMessageResponse,
    RequestMessageResponseData,
    RequestSignatureInput,
    RequestSignatureResponse,
    RequestSignatureResponseData,
} from "./auth.dto"
import { ThrottlerConfig, UseThrottler } from "@modules/throttler"
import { GraphQLSuccessMessage } from "../../../interceptors"
import { GraphQLTransformInterceptor } from "../../../interceptors"
import { UseGuards, UseInterceptors } from "@nestjs/common"
import { GraphQLSignatureGuard } from "@modules/passport/guards"
import {
    VerifyMessageInput,
    VerifyMessageResponse,
    VerifyMessageResponseData,
    RefreshTokenInput,
    RefreshTokenResponse,
    RefreshTokenResponseData,
} from "./dto"
import { TrackGraphQL } from "@modules/prometheus/decorators"

@Resolver()
export class AuthResolvers {
    constructor(private readonly authService: AuthService) {}

    @UseThrottler(ThrottlerConfig.Strict)
    @GraphQLSuccessMessage("Colyseus ephemeral JWT requested successfully")
    @UseInterceptors(GraphQLTransformInterceptor)
    @UseGuards(GraphQLSignatureGuard)
    @Mutation(() => RequestColyseusEphemeralJwtResponse)
    @TrackGraphQL({ operationType: "mutation" })
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
    @TrackGraphQL({ operationType: "mutation" })
    async requestSignature(@Args("input") input: RequestSignatureInput): Promise<RequestSignatureResponseData> {
        return await this.authService.requestSignature(input)
    }

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("Message verified successfully")
    @UseInterceptors(GraphQLTransformInterceptor)
    @Mutation(() => VerifyMessageResponse)
    @TrackGraphQL({ operationType: "mutation" })
    public async verifyMessage(@Args("input") input: VerifyMessageInput): Promise<VerifyMessageResponseData> {
        return await this.authService.verifyMessage(input)
    }

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("Refresh token refreshed successfully")
    @UseInterceptors(GraphQLTransformInterceptor)
    @Mutation(() => RefreshTokenResponse)
    @TrackGraphQL({ operationType: "mutation" })
    public async refreshToken(@Args("input") input: RefreshTokenInput): Promise<RefreshTokenResponseData> {
        return await this.authService.refreshToken(input.refreshToken)
    }

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("Message requested successfully")
    @UseInterceptors(GraphQLTransformInterceptor)
    @Query(() => RequestMessageResponse)
    @TrackGraphQL({ operationType: "query" })
    public async requestMessage(@Args("input") input: RequestMessageInput): Promise<RequestMessageResponseData> {
        return await this.authService.requestMessage(input)
    }
}
