import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass } from "./handlers.module-definition"
import { MixinModule } from "@modules/mixin"
import { createColyseusServerProvider } from "@modules/colyseus/colyseus.providers"
import { ColyseusService } from "@modules/colyseus/colyseus.service"

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
            providers: [...(dynamicModule.providers || []), ...providers],
            exports: [...providers],
        }
    }
}
