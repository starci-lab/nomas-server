import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./queries.module-definition"
import { UsersModule } from "./users"
import { StaticModule } from "./static"

@Module({
    imports: [
        UsersModule.register({}),
        StaticModule.register({}),
    ],
})
export class GameQueriesModule extends ConfigurableModuleClass {}