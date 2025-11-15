import { DynamicModule, Module, Provider } from "@nestjs/common"
import { PetGameService } from "./pet.service"

@Module({})
export class GameplayPetModule {
    static register(): DynamicModule {
        const providers: Provider[] = [PetGameService]
        return {
            module: GameplayPetModule,
            providers,
            exports: providers,
        }
    }
}
