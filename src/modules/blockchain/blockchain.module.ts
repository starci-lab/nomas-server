import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { ConfigurableModuleClass } from "./blockchain.module-definition"
import { NonceService } from "./signature"

@Module({
    imports: [
        AuthModule,
    ],
    providers: [NonceService],
    exports: [AuthModule, NonceService],
})
export class BlockchainModule extends ConfigurableModuleClass {}
