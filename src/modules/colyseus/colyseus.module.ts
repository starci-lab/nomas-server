import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass } from "./colyseus.module-definition"
import { createColyseusServerProvider } from "./colyseus.providers"
import { ColyseusService } from "./colyseus.service"
import { MixinModule } from "@modules/mixin"
import { PetHandlersModule, FoodHandlersModule, InventoryHandlersModule, PlayerHandlersModule } from "./handlers"
import { OPTIONS_TYPE } from "./colyseus.module-definition"
import { WinstonModule } from "@winston"
import { WinstonLevel, WinstonLogType } from "@winston"

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
    static forRoot(options?: Partial<typeof OPTIONS_TYPE>): DynamicModule {
        const dynamicModule = super.register({
            isGlobal: true,
            ...options,
        })
        const providers: Array<Provider> = []
        providers.push(createColyseusServerProvider())
        providers.push(ColyseusService)

        const imports = [...(dynamicModule.imports || [])]

        // Import WinstonModule to ensure Winston logger is available for dependency injection
        // Even though WinstonModule is global, we need to explicitly import it in the dynamic module
        imports.push(
            WinstonModule.register({
                appName: "nomas-colyseus",
                level: WinstonLevel.Info,
                logTypes: [WinstonLogType.Console, WinstonLogType.Loki],
                isGlobal: true,
            }),
        )

        imports.push(PetHandlersModule, FoodHandlersModule, InventoryHandlersModule, PlayerHandlersModule)

        return {
            ...dynamicModule,
            imports,
            providers: [...(dynamicModule.providers || []), ...providers],
            exports: [...providers],
        }
    }
}
