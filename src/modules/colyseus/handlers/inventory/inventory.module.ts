import { Module } from "@nestjs/common"
import { GameplayInventoryModule } from "@modules/gameplay"
import { InventoryEventHandler } from "./inventory.event-handler"
import { ConfigurableModuleClass } from "./inventory.module-definition"

@Module({
    imports: [GameplayInventoryModule],
    providers: [InventoryEventHandler],
    exports: [InventoryEventHandler],
})
export class InventoryHandlersModule extends ConfigurableModuleClass {}
