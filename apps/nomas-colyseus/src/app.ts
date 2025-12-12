import { Module } from "@nestjs/common"
import { GameMongooseModule } from "@modules/databases"
import { MixinModule } from "@modules/mixin"
import { EnvModule } from "@modules/env"
import { ThrottlerModule } from "@modules/throttler"
import { PassportModule } from "@modules/passport"
import { BlockchainModule } from "@modules/blockchain"
import { ColyseusModule } from "@modules/colyseus"
import { EventModule } from "@modules/event"
import { SentryCatchAllExceptionFilter, SentryModule } from "@modules/sentry"
import { APP_FILTER } from "@nestjs/core"
import { GraphQLModule } from "@modules/graphql"
import { WinstonLevel, WinstonLogType, WinstonModule } from "@winston"
import { AppService } from "@apps/nomas-server/src/app.service"
import { TestController } from "./test.controller"
import { PrometheusModule } from "@modules/prometheus/prometheus.module"
import { CacheModule } from "@modules/cache"
import { JwtModule } from "@modules/jwt"
import { ColyseusCronModule } from "@modules/colyseus-cron"

@Module({
    imports: [
        EnvModule.forRoot({
            isGlobal: true,
        }),
        WinstonModule.register({
            appName: "nomas-colyseus",
            level: WinstonLevel.Info,
            logTypes: [WinstonLogType.Console, WinstonLogType.Loki],
            isGlobal: true,
        }),
        CacheModule.register({
            isGlobal: true,
        }),
        ThrottlerModule.register({
            isGlobal: true,
        }),
        BlockchainModule.register({
            isGlobal: true,
        }),
        PassportModule.register({
            isGlobal: true,
        }),
        // we require mongodb for the core module
        GameMongooseModule.forRoot({
            isGlobal: true,
            withSeeder: true,
            loadToMemory: true,
        }),
        MixinModule.register({
            loadNextJsQueryService: false,
            isGlobal: true,
        }),
        EventModule.register({
            isGlobal: true,
        }),
        ColyseusModule.forRoot({
            isGlobal: true,
            useRedisDriver: true,
            useRedisPresence: true,
        }),
        GraphQLModule.register({
            resolvers: {
                game: true,
            },
            plugins: {
                json: false,
            },
            isGlobal: true,
        }),
        JwtModule.register({
            isGlobal: true,
        }),
        SentryModule.register({
            isGlobal: true,
        }),
        PrometheusModule.register({
            isGlobal: true,
            defaultMetrics: {
                enabled: true,
            },
        }),
        ColyseusCronModule.register({
            isGlobal: true,
        }),
    ],
    controllers: [TestController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: SentryCatchAllExceptionFilter,
        },
    ],
})
export class AppModule {}
