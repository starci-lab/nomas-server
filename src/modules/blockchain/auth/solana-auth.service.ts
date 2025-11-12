import { Injectable, Logger } from "@nestjs/common"
import { IAuthService, SignResponse, VerifyParams } from "./auth.interface"
import nacl from "tweetnacl"
import { PublicKey } from "@solana/web3.js"
import bs58 from "bs58"

@Injectable()
export class SolanaAuthService implements IAuthService {
    private readonly logger = new Logger(SolanaAuthService.name)
    constructor() {}

    sign(): Promise<SignResponse> | SignResponse {
        throw new Error("Method not implemented.")
    }

    // verify Solana signature
    /**
     * Verify Solana signature
     * @param params - Verify params
     * @returns True if signature is valid, false otherwise
     */
    async verify({
        accountAddress,
        message,
        signature,
    }: VerifyParams): Promise<boolean> {
        try {
            // Parse public key
            const pubKey = new PublicKey(accountAddress)
            // Decode signature (thường client sẽ gửi base58)
            const sigBytes = Uint8Array.from(
                bs58.decode(signature)
            )
            // Encode message
            const msgBytes = new TextEncoder().encode(message)
            // Verify signature
            const isValid = nacl.sign.detached.verify(
                msgBytes,
                sigBytes,
                pubKey.toBytes()
            )
            return isValid
        } catch (error) {
            this.logger.debug(error)
            return false
        }
    }
}