import { Module } from "@nestjs/common"
import { FoodHandler } from "./food.handler"
import { FoodSyncService } from "./food-sync.service"
import { ConfigurableModuleClass } from "./food.module-definition"

@Module({
    providers: [FoodHandler, FoodSyncService],
    exports: [FoodHandler, FoodSyncService],
})
export class FoodHandlersModule extends ConfigurableModuleClass {}
