import { Module } from "@nestjs/common"
import { GameplayModule } from "@modules/gameplay"
import { GameMemdbModule } from "@modules/databases"
import { InventoryEventHandler } from "./inventory.event-handler"
import { ConfigurableModuleClass } from "./inventory.module-definition"

@Module({
    imports: [GameplayModule.register({}), GameMemdbModule.register({})],
    providers: [InventoryEventHandler],
    exports: [InventoryEventHandler],
})
export class InventoryHandlersModule extends ConfigurableModuleClass {}
