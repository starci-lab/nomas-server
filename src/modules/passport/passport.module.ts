import { Module } from "@nestjs/common"
import {
    GraphQLSignatureStrategy,
} from "./strategies"
import { PassportModule as NestPassportModule } from "@nestjs/passport"
import { ConfigurableModuleClass } from "./passport.module-definition"

@Module({
    imports: [
        NestPassportModule.register({}), 
    ],
    providers: [
        GraphQLSignatureStrategy,
    ],
    exports: [GraphQLSignatureStrategy],
})
export class PassportModule extends ConfigurableModuleClass {}
