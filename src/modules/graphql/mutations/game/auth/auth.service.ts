import { Injectable, Logger } from "@nestjs/common"
import {
    RequestColyseusEphemeralJwtResponseData,
    RequestSignatureInput,
    RequestSignatureResponseData,
} from "./auth.dto"
import { JwtEphemeralService } from "@modules/passport"
import { NonceService } from "@modules/blockchain"
import { envConfig } from "@modules/env"
import { AuthService as BlockchainAuthService } from "@modules/blockchain"
import { InjectGameMongoose, MemdbStorageService, OwnedPetSchema, UserSchema } from "@modules/databases"
import { Connection } from "mongoose"
import { VerifyMessageInput } from "@modules/graphql/mutations/game/auth/dto"
import { MutationAuthInvalidSignatureException } from "@exceptions"

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    constructor(
        private readonly jwtEphemeralService: JwtEphemeralService,
        private readonly nonceService: NonceService,
        private readonly blockchainAuthService: BlockchainAuthService,
        @InjectGameMongoose()
        private readonly connection: Connection,
        private readonly memdbStorageService: MemdbStorageService,
    ) {}

    async requestColyseusEphemeralJwt(): Promise<RequestColyseusEphemeralJwtResponseData> {
        const jwt = await this.jwtEphemeralService.generateEphemeralJwt({})
        return {
            jwt: jwt,
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

    async verifyMessage(request: VerifyMessageInput) {
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
                    /************************************************************
                     * CREATE NEW USER
                     ************************************************************/
                    user = await this.connection
                        .model<UserSchema>(UserSchema.name)
                        .create({ accountAddress: address, platform })

                    /************************************************************
                     * CREATE INITIAL PET FOR USER
                     ************************************************************/
                    const defaultInfo = this.memdbStorageService.getDefaultInfo()
                    await this.connection.model<OwnedPetSchema>(OwnedPetSchema.name).create({
                        ownerId: user._id,
                        petType: defaultInfo.defaultPetId,
                    })
                    /************************************************************
                     * GENERATE AUTH TOKENS
                     ************************************************************/
                    const {
                        accessToken,
                        refreshToken: { token: refreshToken, expiredAt },
                    } = await this.jwtEphemeralService.generateAuthCredentials({
                        userId: user.id,
                        platform: user.platform,
                        userAddress: user.accountAddress,
                    })
                    return {
                        accessToken,
                        refreshToken: {
                            token: refreshToken,
                            expiredAt,
                        },
                    }
                }
            })
            return result
        } catch (error) {
            this.logger.debug(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
