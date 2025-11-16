import { Module } from "@nestjs/common"
import { PlayerEventHandler } from "./player.event-handler"
import { PlayerSyncService } from "./player-sync.service"
import { ConfigurableModuleClass } from "./player.module-definition"

@Module({
    providers: [PlayerEventHandler, PlayerSyncService],
    exports: [PlayerEventHandler, PlayerSyncService],
})
export class PlayerHandlersModule extends ConfigurableModuleClass {}
