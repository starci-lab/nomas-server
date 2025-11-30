import { Module } from "@nestjs/common"
import { PlayerHandler } from "./player.handler"
import { PlayerSyncService } from "./player-sync.service"
import { ConfigurableModuleClass } from "./player.module-definition"

@Module({
    providers: [PlayerHandler, PlayerSyncService],
    exports: [PlayerHandler, PlayerSyncService],
})
export class PlayerHandlersModule extends ConfigurableModuleClass {}
