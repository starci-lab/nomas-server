import { Module } from "@nestjs/common"
import { GameMemdbModule } from "@modules/databases"
import { InventoryEventHandler } from "./inventory.event-handler"
import { ConfigurableModuleClass } from "./inventory.module-definition"
import { PlayerSyncService } from "../player-sync.service"

@Module({
    imports: [GameMemdbModule.register({})],
    providers: [InventoryEventHandler, PlayerSyncService],
    exports: [InventoryEventHandler],
})
export class InventoryHandlersModule extends ConfigurableModuleClass {}
