import { Injectable, Logger } from "@nestjs/common"
import { IAuthService, VerifyParams } from "./auth.interface"
import { fromB64 } from "@mysten/sui/utils"
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519"

@Injectable()
export class SuiAuthService implements IAuthService {
    private readonly logger = new Logger(SuiAuthService.name)
    constructor() {}

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
            const pub = new Ed25519PublicKey(fromB64(publicKey))
            const sigBytes = fromB64(signature)
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