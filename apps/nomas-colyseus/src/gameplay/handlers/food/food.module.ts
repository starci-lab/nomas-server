import { Module } from "@nestjs/common"
import { GameplayFoodModule } from "@modules/gameplay"
import { FoodMessageHandlers } from "./food.message-handlers"
import { FoodEventHandler } from "./food.event-handler"

@Module({
    imports: [GameplayFoodModule],
    providers: [FoodMessageHandlers, FoodEventHandler],
    exports: [FoodMessageHandlers, FoodEventHandler],
})
export class FoodHandlersModule {}
