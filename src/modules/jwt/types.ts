export interface JwtPayloadType {
    sessionId: string
    userId: string
    iat: number
    exp: number
}
