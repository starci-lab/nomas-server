import { DynamicModule, Module, Provider } from "@nestjs/common"
import { InventoryGameService } from "./inventory.service"
import { GameMemdbModule } from "@modules/databases"

@Module({})
export class GameplayInventoryModule {
    static register(): DynamicModule {
        const providers: Provider[] = [InventoryGameService]
        return {
            module: GameplayInventoryModule,
            imports: [GameMemdbModule],
            providers,
            exports: providers,
        }
    }
}
