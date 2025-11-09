import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { ConfigurableModuleClass } from "./blockchain.module-definition"

@Module({
    imports: [
        AuthModule,
    ],
    exports: [AuthModule],
})
export class BlockchainModule extends ConfigurableModuleClass {}
