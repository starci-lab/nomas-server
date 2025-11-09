import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AptosAuthService } from "./aptos-auth.service"
import { SuiAuthService } from "./sui-auth.service"
import { EvmAuthService } from "./evm-auth.service"
import { SolanaAuthService } from "./solana-auth.service"

@Module({
    providers: [
        AptosAuthService,
        SuiAuthService,
        EvmAuthService,
        SolanaAuthService,
        AuthService,
    ],
    exports: [AuthService],
})
export class AuthModule {}
