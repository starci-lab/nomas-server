import { DynamicModule, Module, Provider } from "@nestjs/common"
import { PlayerGameService } from "./player.service"

@Module({})
export class GameplayPlayerModule {
    static register(): DynamicModule {
        const providers: Provider[] = [PlayerGameService]
        return {
            module: GameplayPlayerModule,
            providers,
            exports: providers,
        }
    }
}
