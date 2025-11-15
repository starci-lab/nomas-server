import { Module } from "@nestjs/common"
import { FoodGameService } from "./food.service"
import { ConfigurableModuleClass } from "./food.module-definition"

@Module({
    providers: [
        FoodGameService
    ],
    exports: [
        FoodGameService
    ]
})
export class GameplayFoodModule extends ConfigurableModuleClass {
}
