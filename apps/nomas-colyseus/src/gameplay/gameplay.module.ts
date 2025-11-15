import { HandlerModule } from "./handlers"
import { EmitterModule } from "./emitter"
import { Module } from "@nestjs/common"

@Module({
    imports: [
        EmitterModule.register({
            isGlobal: true,
        }),
        HandlerModule.register(),
    ],
})
export class GameplayNamespaceModule {}
