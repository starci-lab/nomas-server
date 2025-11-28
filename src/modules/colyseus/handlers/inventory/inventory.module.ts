import { Module } from "@nestjs/common"
import { GameMemdbModule } from "@modules/databases"
import { InventoryHandler } from "./inventory.handler"
import { ConfigurableModuleClass } from "./inventory.module-definition"
import { PlayerHandlersModule } from "../player/player.module"

@Module({
    imports: [PlayerHandlersModule, GameMemdbModule.register({})],
    providers: [InventoryHandler],
    exports: [InventoryHandler],
})
export class InventoryHandlersModule extends ConfigurableModuleClass {}
