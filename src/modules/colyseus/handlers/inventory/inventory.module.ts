import { Module } from "@nestjs/common"
import { GameplayInventoryModule } from "@modules/gameplay"
import { InventoryEventHandler } from "./inventory.event-handler"

@Module({
    imports: [GameplayInventoryModule],
    providers: [InventoryEventHandler],
    exports: [InventoryEventHandler],
})
export class InventoryHandlersModule {}
