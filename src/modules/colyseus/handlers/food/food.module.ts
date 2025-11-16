import { Module } from "@nestjs/common"
import { GameplayModule } from "@modules/gameplay"
import { FoodEventHandler } from "./food.event-handler"
import { ConfigurableModuleClass } from "./food.module-definition"

@Module({
    imports: [GameplayModule.register({})],
    providers: [FoodEventHandler],
    exports: [FoodEventHandler],
})
export class FoodHandlersModule extends ConfigurableModuleClass {}
