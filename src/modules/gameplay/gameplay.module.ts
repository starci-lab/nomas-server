import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./gameplay.module-definition"
import { PetGameService } from "@modules/gameplay/pet/pet.service"
import { FoodGameService } from "@modules/gameplay/food/food.service"
import { InventoryGameService } from "@modules/gameplay/inventory/inventory.service"
import { PlayerGameService } from "@modules/gameplay/player/player.service"

@Module({})
export class GameplayModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const dynamicModule = super.register(options)
        // services that are always loaded
        const services: Array<Provider> = [
            PetGameService, 
            FoodGameService, 
            InventoryGameService, 
            PlayerGameService
        ]
        const imports: Array<DynamicModule> = []
        const providers: Array<Provider> = services
        const exports: Array<Provider> = services

        return {
            ...dynamicModule,
            imports,
            providers: [...(dynamicModule.providers || []), ...providers],
            exports: [...exports],
        }
    }
}
