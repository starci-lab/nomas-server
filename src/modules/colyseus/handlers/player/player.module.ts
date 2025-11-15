import { Module } from "@nestjs/common"
import { GameplayPlayerModule } from "@modules/gameplay"
import { PlayerMessageHandlers } from "./player.message-handlers"
import { PlayerEventHandler } from "./player.event-handler"

@Module({
    imports: [GameplayPlayerModule],
    providers: [PlayerMessageHandlers, PlayerEventHandler],
    exports: [PlayerMessageHandlers, PlayerEventHandler],
})
export class PlayerHandlersModule {}
