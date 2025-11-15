import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurablePetModuleClass, GAME_PET_MODULE_OPTIONS_TYPE } from "./pet.module-definition"

@Module({})
export class GamePetModule extends ConfigurablePetModuleClass {
    static register(options: typeof GAME_PET_MODULE_OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
        }
    }
}
