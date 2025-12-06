import { forwardRef, Module } from "@nestjs/common"
import { PlayerHandler } from "./player.handler"
import { PlayerSyncService } from "./player-sync.service"
import { ConfigurableModuleClass } from "./player.module-definition"
import { PetHandlersModule } from "../pet"

@Module({
    imports: [forwardRef(() => PetHandlersModule)],
    providers: [PlayerHandler, PlayerSyncService],
    exports: [PlayerHandler, PlayerSyncService],
})
export class PlayerHandlersModule extends ConfigurableModuleClass {}
