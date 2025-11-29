import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { envConfig } from "@modules/env"
import { Request } from "express"
import { ExtractJwt, Strategy } from "passport-jwt"
import { SignatureInvalidException } from "@exceptions"
import { AuthService } from "@modules/graphql/mutations/game/auth/auth.service"

@Injectable()
export class GraphQLJwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: envConfig().secret.jwt,
            passReqToCallback: true,
        })
    }

    async validate(req: Request) {
        try {
            const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
            const payload = await this.authService.verifyAccessToken(token as string)
            return payload
        } catch {
            throw new SignatureInvalidException("Signature is invalid")
        }
    }
}
