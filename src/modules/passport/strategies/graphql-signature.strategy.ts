import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-custom"
import { AuthService } from "@modules/blockchain"
import { 
    PublicKeyRequiredException, 
    AccountAddressRequiredException, 
    SignatureRequiredException, 
    MessageRequiredException, 
    PlatformRequiredException, 
    MessageInvalidException,
    SignatureInvalidException
} from "@exceptions"
import { INonceMessage } from "@typedefs"
import { envConfig } from "@modules/env"
import { DayjsService } from "@modules/mixin"
import { Request } from "express"

export const GRAPHQL_SIGNATURE_STRATEGY = "graphql-signature"
@Injectable()
export class GraphQLSignatureStrategy extends PassportStrategy(
    Strategy, 
    GRAPHQL_SIGNATURE_STRATEGY
) {
    constructor(
        private readonly authService: AuthService,
        private readonly dayjsService: DayjsService,
    ) {
        super()
    }
    
    private throwSignatureInvalidException(): void {
        throw new SignatureInvalidException("Signature is invalid")
    }

    async validate(req: Request): Promise<void> {
        try {
        // retrieve query and variables from request body
            const { variables } = req.body
            // retrieve input from query
            const { input } = variables
            // retrieve signature, public key, account address, and message from input
            const { signature, publicKey, accountAddress, message, platform } = input
            // check where public key and account address are provided
            if (!publicKey) {
                throw new PublicKeyRequiredException("Public key is required")
            }
            if (!accountAddress) {
                throw new AccountAddressRequiredException("Account address is required")
            }
            if (!signature) {
                throw new SignatureRequiredException("Signature is required")
            }
            if (!message) {
                throw new MessageRequiredException("Message is required")
            }
            if (!platform) {
                throw new PlatformRequiredException("Platform is required")
            }
            const decodedMessage = JSON.parse(message) as INonceMessage
            if (
                !decodedMessage 
            || decodedMessage.nonce < this.dayjsService.now().unix() - envConfig().auth.signature.duration
            ) {
                throw new MessageInvalidException("Message is invalid")
            }
            // verify signature
            const isValid = await this.authService.verify({ 
                publicKey, 
                accountAddress, 
                message, signature, platform })
            // if invalid, throw an exception
            if (!isValid) {
                this.throwSignatureInvalidException()
            }
        } catch {
            this.throwSignatureInvalidException()
        }
    }
}