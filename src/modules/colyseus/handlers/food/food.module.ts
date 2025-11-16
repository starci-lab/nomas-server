import { Module } from "@nestjs/common"
import { GameplayFoodModule } from "@modules/gameplay"
import { FoodEventHandler } from "./food.event-handler"

@Module({
    imports: [GameplayFoodModule],
    providers: [FoodEventHandler],
    exports: [FoodEventHandler],
})
export class FoodHandlersModule {}
