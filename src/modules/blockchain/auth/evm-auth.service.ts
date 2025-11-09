import { Injectable } from "@nestjs/common"
import { IAuthService, VerifyParams } from "./auth.interface"
import { ethers } from "ethers"

@Injectable()
export class EvmAuthService implements IAuthService {
    constructor() {
    }

    // verify EVM signature
    /**
     * Verify EVM signature
     * @param params - Verify params
     * @returns True if signature is valid, false otherwise
     */
    async verify({
        accountAddress,
        message,
        signature,
    }: VerifyParams): Promise<boolean> {
        // verify signature
        const retrievedAddress = ethers.verifyMessage(message, signature)
        // check if recovered address is the same as the account address
        return retrievedAddress.toLowerCase() === accountAddress.toLowerCase()
    }
}