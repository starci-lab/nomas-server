import { BullModule } from "@modules/bullmq"
import { EnvModule } from "@modules/env"
import { MixinModule } from "@modules/mixin"
import { Module } from "@nestjs/common"

@Module({
    imports: [
        EnvModule.forRoot({
            isGlobal: true,
        }),
        MixinModule.register({
            loadNextJsQueryService: false,
            isGlobal: true,
        }),
        BullModule.forRoot({
            isGlobal: true,
        }),
    ],
    providers: [],
})
export class CronWorkerModule {}
