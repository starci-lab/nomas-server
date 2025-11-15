import { Module } from "@nestjs/common"
import { GameplayInventoryModule } from "@modules/gameplay"
import { InventoryMessageHandlers } from "./inventory.message-handlers"
import { InventoryEventHandler } from "./inventory.event-handler"

@Module({
    imports: [GameplayInventoryModule],
    providers: [InventoryMessageHandlers, InventoryEventHandler],
    exports: [InventoryMessageHandlers, InventoryEventHandler],
})
export class InventoryHandlersModule {}
