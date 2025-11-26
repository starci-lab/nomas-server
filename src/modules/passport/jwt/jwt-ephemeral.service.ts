import { Injectable, Logger } from "@nestjs/common"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import { envConfig } from "@modules/env"
import ms, { StringValue } from "ms"
import { v4 } from "uuid"
import { DayjsService } from "@modules/mixin"
import { Platform } from "@typedefs"

export interface GenerateEphemeralJwtParams {
    time?: ms.StringValue
}

export interface GenerateAuthCredentialsPayload {
    userId: string
    platform: Platform
    userAddress: string
}

@Injectable()
export class JwtEphemeralService {
    private readonly logger = new Logger(JwtEphemeralService.name)
    constructor(
        private readonly jwtService: NestJwtService,
        private readonly dayjsService: DayjsService,
    ) {}

    // generate ephemeral JWT, last about 1 minute
    async generateEphemeralJwt({ time = "1m" }: GenerateEphemeralJwtParams): Promise<string> {
        return this.jwtService.sign(
            {
                time,
            },
            {
                secret: envConfig().secret.jwt,
                expiresIn: time,
            },
        )
    }

    public async generateAuthCredentials(payload: GenerateAuthCredentialsPayload) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: envConfig().secret.jwt,
                expiresIn: envConfig().secret.accessTokenExpiration as StringValue,
            }),
            v4(),
        ])
        return {
            accessToken,
            refreshToken: {
                token: refreshToken,
                expiredAt: await this.getExpiredAt(),
            },
        }
    }

    public async verifyToken(token: string) {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: envConfig().secret.jwt,
            })
        } catch (ex) {
            this.logger.error(ex)
            return null
        }
    }

    public async decodeToken(token: string) {
        try {
            return this.jwtService.decode(token)
        } catch (ex) {
            this.logger.error(ex)
            return null
        }
    }

    private async getExpiredAt(): Promise<Date | null> {
        try {
            const expiresIn = envConfig().secret.refreshTokenExpiration
            return this.dayjsService.fromMs(expiresIn as StringValue).toDate()
        } catch (ex) {
            this.logger.error("Failed to get expiration time from token", ex.message)
            return null
        }
    }
}
