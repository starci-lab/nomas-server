import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common"
import {
    RequestColyseusEphemeralJwtResponseData,
    RequestMessageInput,
    RequestMessageResponseData,
    RequestSignatureInput,
    RequestSignatureResponseData,
} from "./auth.dto"
import { JwtEphemeralService, JwtPayloadType, JwtRefreshPayloadType } from "@modules/jwt"
import { NonceService } from "@modules/blockchain"
import { envConfig } from "@modules/env"
import { AuthService as BlockchainAuthService } from "@modules/blockchain"
import { InjectGameMongoose, MemdbStorageService, OwnedPetSchema, SessionSchema, UserSchema } from "@modules/databases"
import { Connection } from "mongoose"
import { VerifyMessageInput, VerifyMessageResponseData } from "../auth/dto"
import { GraphQLAuthSessionInvalidException, MutationAuthInvalidSignatureException } from "@exceptions"
import { createObjectId } from "@utils"
import crypto from "crypto"
import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util"
import { CacheKey, CacheService, createCacheKey } from "@modules/cache"

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    constructor(
        @Inject(forwardRef(() => JwtEphemeralService))
        private readonly jwtEphemeralService: JwtEphemeralService,
        private readonly nonceService: NonceService,
        private readonly blockchainAuthService: BlockchainAuthService,
        @InjectGameMongoose()
        private readonly connection: Connection,
        private readonly memdbStorageService: MemdbStorageService,
        private readonly cacheService: CacheService,
    ) {}

    async requestColyseusEphemeralJwt(): Promise<RequestColyseusEphemeralJwtResponseData> {
        const jwt = await this.jwtEphemeralService.generateEphemeralJwt({})
        return {
            jwt: jwt,
        }
    }

    async requestMessage(input: RequestMessageInput): Promise<RequestMessageResponseData> {
        const nonceMessage = await this.nonceService.generateNonceMessage(input.platform)
        return {
            message: JSON.stringify(nonceMessage),
        }
    }

    async requestSignature(input: RequestSignatureInput): Promise<RequestSignatureResponseData> {
        const nonceMessage = await this.nonceService.generateNonceMessage(input.platform)
        const privateKey = envConfig().mockPrivateKeys[input.platform]
        const { signature, publicKey, accountAddress } = await this.blockchainAuthService.sign({
            privateKey: privateKey,
            message: JSON.stringify(nonceMessage),
            platform: input.platform,
        })
        return {
            signature: signature,
            message: JSON.stringify(nonceMessage),
            publicKey,
            accountAddress,
        }
    }

    async verifyMessage(request: VerifyMessageInput): Promise<VerifyMessageResponseData> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async () => {
                const { message, address, signedMessage, platform } = request
                /************************************************************
                 * VALIDATE MESSAGE AND SIGNATURE
                 ************************************************************/
                const isVerified = await this.blockchainAuthService.verify({
                    publicKey: address,
                    accountAddress: address,
                    message: message,
                    signature: signedMessage,
                    platform: platform,
                })
                if (!isVerified) {
                    throw new MutationAuthInvalidSignatureException("Signature is invalid")
                }
                /************************************************************
                 * FIND OR CREATE USER
                 ************************************************************/
                let user = await this.connection.model<UserSchema>(UserSchema.name).findOne({ accountAddress: address })
                if (!user) {
                    const defaultInfo = this.memdbStorageService.getDefaultInfo()
                    /************************************************************
                     * CREATE NEW USER
                     ************************************************************/
                    user = await this.connection
                        .model<UserSchema>(UserSchema.name)
                        .create({ accountAddress: address, platform, tokenNom: defaultInfo.tokenNom })

                    /************************************************************
                     * CREATE INITIAL PET FOR USER
                     ************************************************************/
                    await this.connection.model<OwnedPetSchema>(OwnedPetSchema.name).create({
                        user: user._id,
                        type: createObjectId(defaultInfo.defaultPetId),
                        name: defaultInfo.defaultPetName,
                    })
                }

                /************************************************************
                 * GENERATE AUTH TOKENS
                 ************************************************************/
                const hash = crypto.createHash("sha256").update(randomStringGenerator()).digest("hex")
                const session = await this.connection.model<SessionSchema>(SessionSchema.name).create({
                    user: user.id,
                    hash,
                })

                const {
                    accessToken,
                    refreshToken: { token, expiredAt },
                } = await this.jwtEphemeralService.generateAuthCredentials({
                    userId: user.id,
                    platform: user.platform,
                    userAddress: user.accountAddress,
                    sessionId: session.id,
                    hash,
                })

                const response: VerifyMessageResponseData = {
                    accessToken,
                    refreshToken: {
                        token,
                        expiredAt,
                    },
                }

                return response
            })
            return result
        } catch (error) {
            this.logger.debug(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }

    async verifyAccessToken(accessToken: string) {
        const payload: JwtPayloadType = await this.jwtEphemeralService.verifyToken(accessToken)

        // Force logout if the session is in the blacklist
        const isSessionBlacklisted = await this.cacheService.get<boolean>(
            createCacheKey(CacheKey.SessionBlacklist, payload.sessionId),
        )

        if (isSessionBlacklisted) {
            throw new GraphQLAuthSessionInvalidException("Session is blacklisted")
        }

        return payload
    }

    async verifyRefreshToken(refreshToken: string): Promise<JwtRefreshPayloadType> {
        try {
            return await this.jwtEphemeralService.verifyToken(refreshToken)
        } catch {
            throw new GraphQLAuthSessionInvalidException("Refresh token is invalid")
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            /************************************************************
             * RETRIEVE AND VALIDATE SESSION
             ************************************************************/
            const { sessionId, hash } = await this.verifyRefreshToken(refreshToken)
            const session = await this.connection.model<SessionSchema>(SessionSchema.name).findOne({ _id: sessionId })
            if (!session || session.hash !== hash) {
                throw new GraphQLAuthSessionInvalidException("Session is invalid")
            }

            /************************************************************
             * RETRIEVE AND VALIDATE USER
             ************************************************************/
            const user = await this.connection.model<UserSchema>(UserSchema.name).findOne({ _id: session.user._id })
            if (!user) {
                throw new GraphQLAuthSessionInvalidException("User not found")
            }

            /************************************************************
             * GENERATE NEW AUTH CREDENTIALS
             ************************************************************/
            const newHash = crypto.createHash("sha256").update(randomStringGenerator()).digest("hex")

            return await this.jwtEphemeralService.generateAuthCredentials({
                userId: user.id,
                platform: user.platform,
                userAddress: user.accountAddress,
                sessionId: session.id,
                hash: newHash,
            })
        } catch (error) {
            this.logger.debug(error)
            throw error
        }
    }
}
