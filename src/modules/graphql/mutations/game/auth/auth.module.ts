import { forwardRef, Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./auth.module-definition"
import { AuthResolvers } from "./auth.resolvers"
import { AuthService } from "./auth.service"
import { PassportModule } from "@modules/passport"

@Module({
    imports: [forwardRef(() => PassportModule)],
    providers: [AuthResolvers, AuthService],
    exports: [AuthService],
})
export class AuthModule extends ConfigurableModuleClass {}
