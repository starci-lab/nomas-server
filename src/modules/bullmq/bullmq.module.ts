import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./bullmq.module-definition"
import { DynamicModule, Module } from "@nestjs/common"
import { BullQueueName, RegisterQueueOptions } from "./types"
import { bullData } from "./queue"
import { envConfig } from "@modules/env/config"
import Redis from "ioredis"
import { createIoRedisKey, IoRedisModule } from "@modules/native"

@Module({})
export class BullModule extends ConfigurableModuleClass {
    // register the queue
    public static registerQueue(options: RegisterQueueOptions = {}): DynamicModule {
        const queueName = options.queueName || BullQueueName.LiquidityPools
        // register the queue
        const registerQueueDynamicModule = NestBullModule.registerQueue({
            name: `${bullData[queueName].name}`,
            prefix: bullData[queueName].prefix,
        })
        return {
            global: options.isGlobal,
            module: BullModule,
            imports: [registerQueueDynamicModule],
            exports: [registerQueueDynamicModule],
        }
    }

    // for root
    public static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
            imports: [
                NestBullModule.forRootAsync({
                    imports: [
                        IoRedisModule.register({
                            host: envConfig().redis.cache.host,
                            port: envConfig().redis.cache.port as number,
                            password: envConfig().redis.cache.password,
                            requirePassword: envConfig().redis.cache.requirePassword,
                            maxRetriesPerRequest: null,
                        }),
                    ],
                    inject: [createIoRedisKey()],
                    useFactory: async (redis: Redis) => {
                        return {
                            connection: redis,
                        }
                    },
                }),
            ],
        }
    }
}
