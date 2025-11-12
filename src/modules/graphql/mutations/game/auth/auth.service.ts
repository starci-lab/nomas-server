import { Injectable } from "@nestjs/common"
import { 
    RequestColyseusEphemeralJwtResponseData, 
    RequestSignatureInput,
    RequestSignatureResponseData
} from "./auth.dto"
import { JwtEphemeralService } from "@modules/passport"
import { NonceService } from "@modules/blockchain"
import { envConfig } from "@modules/env"
import { AuthService as BlockchainAuthService } from "@modules/blockchain"

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtEphemeralService: JwtEphemeralService,
        private readonly nonceService: NonceService,
        private readonly blockchainAuthService: BlockchainAuthService,
    ) {}

    async requestColyseusEphemeralJwt(
    ): Promise<RequestColyseusEphemeralJwtResponseData> {
        const jwt = await this.jwtEphemeralService.generateEphemeralJwt({})
        return {
            jwt: jwt,
        }
    }

    async requestSignature(
        input: RequestSignatureInput
    ): Promise<RequestSignatureResponseData> {
        const nonceMessage = await this.nonceService.generateNonceMessage(input.platform)
        const privateKey = envConfig().mockPrivateKeys[input.platform]
        const {
            signature,
            publicKey,
            accountAddress,
        } = await this.blockchainAuthService.sign({
            privateKey: privateKey,
            message: JSON.stringify(nonceMessage),
            platform: input.platform,
        })
        return {
            signature: signature,
            message: JSON.stringify(nonceMessage),
            publicKey,
            accountAddress,
        }
    }
}