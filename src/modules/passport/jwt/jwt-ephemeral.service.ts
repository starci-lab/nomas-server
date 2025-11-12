import { Injectable } from "@nestjs/common"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import { envConfig } from "@modules/env"
import ms from "ms"

export interface GenerateEphemeralJwtParams {
    time?: ms.StringValue
}

@Injectable()
export class JwtEphemeralService {
    constructor(
        private readonly jwtService: NestJwtService,
    ) { }
    
    // generate ephemeral JWT, last about 1 minute
    async generateEphemeralJwt(
        {
            time = "1m",
        }: GenerateEphemeralJwtParams,
    ): Promise<string> {
        return this.jwtService.sign({
            time,
        }, {
            secret: envConfig().secret.jwt,
            expiresIn: time,
        })
    }
}