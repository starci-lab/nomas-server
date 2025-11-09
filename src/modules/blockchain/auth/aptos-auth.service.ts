import { Injectable, Logger } from "@nestjs/common"
import { IAuthService, VerifyParams } from "./auth.interface"
import { Ed25519PublicKey, Ed25519Signature } from "@aptos-labs/ts-sdk"

@Injectable()
export class AptosAuthService implements IAuthService {
    private readonly logger = new Logger(AptosAuthService.name)
    constructor() {}
    // verify Aptos signature
    /**
     * Verify Aptos signature
     * @param params - Verify params
     * @returns True if signature is valid, false otherwise
     */
    async verify({
        publicKey,
        message,
        signature,
    }: VerifyParams): Promise<boolean> {
        try {
            // Decode inputs
            const pubKey = new Ed25519PublicKey(publicKey)

            // Verify signature
            const isValid = pubKey.verifySignature({
                message,
                signature: new Ed25519Signature(signature),
            })
            if (!isValid) return false
            return true
        } catch (error) {
            this.logger.debug(error)
            return false
        }
    }
}