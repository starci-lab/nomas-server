import { Module } from "@nestjs/common"
import { FoodEventHandler } from "./food.event-handler"
import { ConfigurableModuleClass } from "./food.module-definition"
import { PlayerHandlersModule } from "../player/player.module"

@Module({
    imports: [PlayerHandlersModule],
    providers: [FoodEventHandler],
    exports: [FoodEventHandler],
})
export class FoodHandlersModule extends ConfigurableModuleClass {}
