import { DynamicModule, Module, Provider } from "@nestjs/common"
import { InventoryGameService } from "./inventory.service"

@Module({})
export class GameplayInventoryModule {
    static register(): DynamicModule {
        const providers: Provider[] = [InventoryGameService]
        return {
            module: GameplayInventoryModule,
            providers,
            exports: providers,
        }
    }
}
