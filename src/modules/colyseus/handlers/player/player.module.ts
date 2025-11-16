import { Module } from "@nestjs/common"
import { PlayerEventHandler } from "./player.event-handler"
import { ConfigurableModuleClass } from "./player.module-definition"

@Module({
    providers: [PlayerEventHandler],
    exports: [PlayerEventHandler],
})
export class PlayerHandlersModule extends ConfigurableModuleClass {}
