import { Module } from "@nestjs/common"
import { GameplayFoodModule } from "@modules/gameplay"
import { FoodEventHandler } from "./food.event-handler"
import { ConfigurableModuleClass } from "./food.module-definition"

@Module({
    imports: [GameplayFoodModule],
    providers: [FoodEventHandler],
    exports: [FoodEventHandler],
})
export class FoodHandlersModule extends ConfigurableModuleClass {}
