import { Module } from "@nestjs/common"
import {
    GraphQLSignatureStrategy,
} from "./strategies"
import { PassportModule as NestPassportModule } from "@nestjs/passport"
import { ConfigurableModuleClass } from "./passport.module-definition"
import { JwtEphemeralService } from "./jwt"
import { JwtModule } from "@nestjs/jwt"

@Module({
    imports: [
        JwtModule.register({}),
        NestPassportModule.register({}), 
    ],
    providers: [
        GraphQLSignatureStrategy,
        JwtEphemeralService,
    ],
    exports: [
        GraphQLSignatureStrategy, 
        JwtEphemeralService
    ],
})
export class PassportModule extends ConfigurableModuleClass {}
