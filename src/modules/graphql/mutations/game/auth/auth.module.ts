import { Module } from "@nestjs/common"     
import { ConfigurableModuleClass } from "./auth.module-definition"
import { AuthResolvers } from "./auth.resolvers"
import { AuthService } from "./auth.service"

@Module({
    providers: [AuthResolvers, AuthService],
})
export class AuthModule extends ConfigurableModuleClass {}