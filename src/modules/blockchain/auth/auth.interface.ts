import { Platform } from "@typedefs"

export interface IAuthService {
    verify(params: VerifyParams): Promise<boolean> | boolean
    sign(params: SignParams): Promise<SignResponse> | SignResponse
}

export interface VerifyParams {
    publicKey: string
    accountAddress: string
    message: string
    signature: string
    platform: Platform
}

export interface SignParams {
    privateKey: string
    message: string
    platform: Platform
}

export interface SignResponse {
    signature: string
    publicKey: string
    accountAddress: string
}