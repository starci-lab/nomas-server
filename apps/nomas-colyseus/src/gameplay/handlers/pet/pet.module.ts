import { DynamicModule, Module, Provider } from "@nestjs/common"
import { GameplayPetModule } from "@modules/gameplay"
import { PetMessageHandlers } from "./pet.message-handlers"
import { PetEventHandler } from "./pet.event-handler"

@Module({})
export class PetHandlersModule {
    static register(): DynamicModule {
        const providers: Provider[] = [PetMessageHandlers, PetEventHandler]
        return {
            module: PetHandlersModule,
            imports: [GameplayPetModule.register()],
            providers,
            exports: providers,
        }
    }
}
