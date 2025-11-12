import { Module } from "@nestjs/common"
import { GameMongooseModule } from "@modules/databases"
import { MixinModule } from "@modules/mixin"
import { GraphQLModule } from "@modules/graphql"
import { EnvModule } from "@modules/env"
import { ThrottlerModule } from "@modules/throttler"
import { PassportModule } from "@modules/passport"
import { BlockchainModule } from "@modules/blockchain"

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
        GraphQLModule.register({
            resolvers: {
                game: true,
            },
            plugins: {
                json: false,
            },
            isGlobal: true,
        }),
    ],
    providers: [
    ],
})
export class AppModule {}
