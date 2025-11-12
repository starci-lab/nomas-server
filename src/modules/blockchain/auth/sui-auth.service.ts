import { Injectable, Logger } from "@nestjs/common"
import { IAuthService, SignResponse, VerifyParams } from "./auth.interface"
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519"
import { fromBase64 } from "@mysten/sui/utils"

@Injectable()
export class SuiAuthService implements IAuthService {
    private readonly logger = new Logger(SuiAuthService.name)
    constructor() {}

    /**
     * Sign message
     * @param params - Sign params
     * @returns Signed message
     */
    sign(): Promise<SignResponse> | SignResponse {
        throw new Error("Method not implemented.")
    }
    // verify Sui signature
    /**
     * Verify Sui signature
     * @param params - Verify params
     * @returns True if signature is valid, false otherwise
     */
    async verify({
        publicKey,
        accountAddress,
        message,
        signature,
    }: VerifyParams): Promise<boolean> {
        try {
            // publicKey & signature đều là base64 string
            const pub = new Ed25519PublicKey(fromBase64(publicKey))
            const sigBytes = fromBase64(signature)
            const msgBytes = new TextEncoder().encode(message)

            // verify chữ ký bằng SDK
            const ok = pub.verify(msgBytes, sigBytes)
            if (!ok) return false

            // cross-check địa chỉ
            const derived = pub.toSuiAddress()
            return derived.toLowerCase() === accountAddress.toLowerCase()
        } catch (error) {
            this.logger.debug(error)
            return false
        }
    }
}