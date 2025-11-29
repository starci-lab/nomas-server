import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./jwt.module-definition"
import { JwtModule as NestJwtModule } from "@nestjs/jwt"
import { JwtEphemeralService } from "./jwt-ephemeral.service"

@Module({
    imports: [NestJwtModule.register({})],
    providers: [JwtEphemeralService],
    exports: [JwtEphemeralService],
})
export class JwtModule extends ConfigurableModuleClass {}
