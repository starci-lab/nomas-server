import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass } from "./handlers.module-definition"
import { createColyseusServerProvider } from "./colyseus.providers"
import { ColyseusService } from "./colyseus.service"
import { MixinModule } from "@modules/mixin"

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
