import { Injectable } from "@nestjs/common"
import { SignParams, VerifyParams } from "./auth.interface"
import { ModuleRef } from "@nestjs/core"
import { AptosAuthService } from "./aptos-auth.service"
import { SuiAuthService } from "./sui-auth.service"
import { Platform } from "@typedefs"
import { EvmAuthService } from "./evm-auth.service"
import { SolanaAuthService } from "./solana-auth.service"
import { PlatformNotFoundException } from "@exceptions"

@Injectable()
export class AuthService {
    constructor(
        private readonly moduleRef: ModuleRef,
    ) {}
    
    /**
     * Verify signature
     * @param params - Verify params
     * @returns True if signature is valid, false otherwise
     */
    async verify(params: VerifyParams) {
        switch (params.platform) {
        case Platform.Evm:
            return this.moduleRef.get(EvmAuthService).verify(params)
        case Platform.Solana:
            return this.moduleRef.get(SolanaAuthService).verify(params)
        case Platform.Sui:
            return this.moduleRef.get(SuiAuthService).verify(params)
        case Platform.Aptos:
            return this.moduleRef.get(AptosAuthService).verify(params)
        default:
            throw new PlatformNotFoundException("Platform not found")
        }   
    }

    /**
     * Sign message
     * @param params - Sign params
     * @returns Signed message
     */
    async sign(params: SignParams) {
        switch (params.platform) {
        case Platform.Evm:
            return this.moduleRef.get(EvmAuthService).sign(params)
        case Platform.Solana:
            return this.moduleRef.get(SolanaAuthService).sign()
        case Platform.Sui:
            return this.moduleRef.get(SuiAuthService).sign()
        case Platform.Aptos:
            return this.moduleRef.get(AptosAuthService).sign()
        default:
            throw new PlatformNotFoundException("Platform not found")
        }
    }
}