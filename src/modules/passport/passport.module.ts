import { forwardRef, Module } from "@nestjs/common"
import { GraphQLJwtStrategy, GraphQLSignatureStrategy } from "./strategies"
import { PassportModule as NestPassportModule } from "@nestjs/passport"
import { ConfigurableModuleClass } from "./passport.module-definition"
import { GraphQLJwtGuard, GraphQLSignatureGuard } from "@modules/passport/guards"
import { JwtModule } from "@modules/jwt"
import { AuthModule } from "@modules/graphql/mutations"

@Module({
    imports: [JwtModule.register({}), NestPassportModule.register({}), forwardRef(() => AuthModule)],
    providers: [GraphQLSignatureStrategy, GraphQLJwtStrategy, GraphQLSignatureGuard, GraphQLJwtGuard],
    exports: [GraphQLJwtGuard, GraphQLSignatureGuard],
})
export class PassportModule extends ConfigurableModuleClass {}
