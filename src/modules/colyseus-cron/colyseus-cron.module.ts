import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass } from "./colyseus-cron.module-definition"
import { BullModule } from "@modules/bullmq"
import { envConfig, EnvModule } from "@modules/env"
import { GameMongooseModule } from "@modules/databases/mongodb/game"
import { PetQueueModule } from "./queues/pet-queue/pet-queue.module"
import { PetEvolutionQueueModule } from "./queues/pet-evolution-queue/pet-evolution.module"
import { PetIncomeQueueModule } from "./queues/pet-income-queue/pet-income.module"

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
        GameMongooseModule.forRoot({
            isGlobal: false,
        }),
        PetQueueModule,
        PetEvolutionQueueModule,
        PetIncomeQueueModule,
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
            imports: [
                ...(dynamicModule.imports || []),
                GameMongooseModule.forRoot({
                    isGlobal: false,
                }),
                PetQueueModule,
                PetEvolutionQueueModule,
                PetIncomeQueueModule,
            ],
            providers: [...(dynamicModule.providers || []), ...providers],
            exports: [...providers],
        }
    }
}
