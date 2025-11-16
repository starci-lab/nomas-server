import { Module } from "@nestjs/common"
import { GameMemdbModule } from "@modules/databases"
import { InventoryEventHandler } from "./inventory.event-handler"
import { ConfigurableModuleClass } from "./inventory.module-definition"
import { PlayerHandlersModule } from "../player/player.module"

@Module({
    imports: [PlayerHandlersModule, GameMemdbModule.register({})],
    providers: [InventoryEventHandler],
    exports: [InventoryEventHandler],
})
export class InventoryHandlersModule extends ConfigurableModuleClass {}
