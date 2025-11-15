import { DynamicModule, Module } from "@nestjs/common"
import { PetHandlersModule } from "./pet/pet.module"

@Module({})
export class HandlerModule {
    static register(): DynamicModule {
        return {
            module: HandlerModule,
            imports: [PetHandlersModule.register()],
        }
    }
}
