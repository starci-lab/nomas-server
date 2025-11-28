import { Module } from "@nestjs/common"
import { FoodHandler } from "./food.handler"
import { ConfigurableModuleClass } from "./food.module-definition"
import { PlayerHandlersModule } from "../player/player.module"

@Module({
    imports: [PlayerHandlersModule],
    providers: [FoodHandler],
    exports: [FoodHandler],
})
export class FoodHandlersModule extends ConfigurableModuleClass {}
