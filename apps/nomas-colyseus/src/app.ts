import { Module } from "@nestjs/common"
import { GameMongooseModule } from "@modules/databases"
import { MixinModule } from "@modules/mixin"
import { EnvModule } from "@modules/env"
import { ThrottlerModule } from "@modules/throttler"
import { PassportModule } from "@modules/passport"
import { BlockchainModule } from "@modules/blockchain"
import { ColyseusModule } from "@modules/colyseus"
import { EventModule } from "@modules/event"
import { GameplayModule } from "@modules/gameplay"

@Module({
    imports: [
        EnvModule.forRoot({
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
        GameplayModule.register({
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
        ColyseusModule.forRoot(),
    ],
    providers: [],
})
export class AppModule {}
