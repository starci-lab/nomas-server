export interface JwtPayloadType {
    sessionId: string
    userId: string
    iat: number
    exp: number
}

export interface JwtRefreshPayloadType {
    sessionId: string
    hash: string
    iat: number
    exp: number
}
