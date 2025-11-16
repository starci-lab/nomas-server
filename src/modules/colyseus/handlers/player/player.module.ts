import { Module } from "@nestjs/common"
import { GameplayPlayerModule } from "@modules/gameplay"
import { PlayerEventHandler } from "./player.event-handler"
import { ConfigurableModuleClass } from "./player.module-definition"

@Module({
    imports: [GameplayPlayerModule],
    providers: [PlayerEventHandler],
    exports: [PlayerEventHandler],
})
export class PlayerHandlersModule extends ConfigurableModuleClass {}
