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
    SignatureInvalidException 
} from "@exceptions"

export const GRAPHQL_SIGNATURE_STRATEGY = "graphql-signature"
@Injectable()
export class GraphQLSignatureStrategy extends PassportStrategy(
    Strategy, 
    GRAPHQL_SIGNATURE_STRATEGY
) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super()
    }

    async validate(req: Request): Promise<boolean> {
        // retrieve query and variables from request body
        const { variables } = await req.json()
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
        // verify signature
        const isValid = await this.authService.verify({ 
            publicKey, 
            accountAddress, 
            message, signature, platform })
        
        // if invalid, throw an exception
        if (!isValid) {
            throw new SignatureInvalidException("Signature is invalid")
        }
        // if valid, we continue to the next strategy
        return true
    }
}