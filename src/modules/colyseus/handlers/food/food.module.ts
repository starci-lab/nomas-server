import { Module } from "@nestjs/common"
import { FoodEventHandler } from "./food.event-handler"
import { ConfigurableModuleClass } from "./food.module-definition"
import { PlayerSyncService } from "../player-sync.service"

@Module({
    providers: [FoodEventHandler, PlayerSyncService],
    exports: [FoodEventHandler],
})
export class FoodHandlersModule extends ConfigurableModuleClass {}
