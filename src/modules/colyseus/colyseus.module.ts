import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass } from "./colyseus.module-definition"
import { createColyseusServerProvider } from "./colyseus.providers"
import { ColyseusService } from "./colyseus.service"
import { MixinModule } from "@modules/mixin"
import { PetHandlersModule, FoodHandlersModule, InventoryHandlersModule, PlayerHandlersModule } from "./handlers"

@Module({
    imports: [
        MixinModule.register({
            loadNextJsQueryService: false,
            isGlobal: true,
        }),
    ],
    providers: [],
    exports: [],
})
export class ColyseusModule extends ConfigurableModuleClass {
    static forRoot(): DynamicModule {
        const dynamicModule = super.register({
            isGlobal: true,
        })
        const providers: Array<Provider> = []
        providers.push(createColyseusServerProvider())
        providers.push(ColyseusService)
        return {
            ...dynamicModule,
            imports: [
                ...(dynamicModule.imports || []),
                PetHandlersModule,
                FoodHandlersModule,
                InventoryHandlersModule,
                PlayerHandlersModule,
            ],
            providers: [...(dynamicModule.providers || []), ...providers],
            exports: [...providers],
        }
    }
}
