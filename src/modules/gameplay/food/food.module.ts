import { DynamicModule, Module, Provider } from "@nestjs/common"
import { FoodGameService } from "./food.service"

@Module({})
export class GameplayFoodModule {
    static register(): DynamicModule {
        const providers: Provider[] = [FoodGameService]
        return {
            module: GameplayFoodModule,
            providers,
            exports: providers,
        }
    }
}
