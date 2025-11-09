import { Platform } from "@typedefs"

export interface IAuthService {
    verify(params: VerifyParams): Promise<boolean> | boolean
}

export interface VerifyParams {
    publicKey: string
    accountAddress: string
    message: string
    signature: string
    platform: Platform
}