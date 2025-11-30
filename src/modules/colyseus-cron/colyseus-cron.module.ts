import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass } from "./colyseus-cron.module-definition"
import { BullModule } from "@modules/bullmq"
import { envConfig, EnvModule } from "@modules/env"

@Module({
    imports: [
        EnvModule.forRoot({
            isGlobal: true,
        }),
        BullModule.forRoot({
            isGlobal: true,
            connection: {
                host: envConfig().redis.cache.host,
                port: envConfig().redis.cache.port as number,
                password: envConfig().redis.cache.password,
                requirePassword: envConfig().redis.cache.requirePassword,
            },
        }),
    ],
    providers: [],
    exports: [],
})
export class ColyseusCronModule extends ConfigurableModuleClass {
    static forRoot(): DynamicModule {
        const dynamicModule = super.register({
            isGlobal: true,
        })
        const providers: Array<Provider> = []
        return {
            ...dynamicModule,
            imports: [...(dynamicModule.imports || [])],
            providers: [...(dynamicModule.providers || []), ...providers],
            exports: [...providers],
        }
    }
}
