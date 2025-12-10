import { Injectable } from "@nestjs/common"
import { IAuthService, SignParams, SignResponse, VerifyParams } from "./auth.interface"
import { ethers } from "ethers"

@Injectable()
export class EvmAuthService implements IAuthService {
    constructor() {}

    // verify EVM signature
    /**
     * Verify EVM signature
     * @param params - Verify params
     * @returns True if signature is valid, false otherwise
     */
    async verify({ accountAddress, message, signature }: VerifyParams): Promise<boolean> {
        // verify signature
        const retrievedAddress = ethers.verifyMessage(message, signature)
        // check if recovered address is the same as the account address
        return retrievedAddress.toLowerCase() === accountAddress.toLowerCase()
    }

    /**
     * Server-side helper to sign an EVM message.
     * @deprecated Avoid handling private keys in the backend; prefer client-side wallet signing.
     * @param params - EVM sign params (message + private key)
     * @returns Signed message and derived addresses
     */
    async sign({ privateKey, message }: SignParams): Promise<SignResponse> {
        // sign message
        const signer = new ethers.Wallet(privateKey)
        const signature = await signer.signMessage(message)
        return {
            signature: signature,
            publicKey: signer.address,
            accountAddress: signer.address,
        }
    }
}
