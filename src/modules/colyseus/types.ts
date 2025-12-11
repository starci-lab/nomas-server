export interface ColyseusOptions {
    /**
     * Whether to use Redis for driver (matchmaking storage)
     * @default false
     */
    useRedisDriver?: boolean
    /**
     * Whether to use Redis for presence (multi-process/multi-machine scaling)
     * @default false
     */
    useRedisPresence?: boolean
    /**
     * Redis connection options for Colyseus
     * Only required if useRedisDriver or useRedisPresence is true
     */
    redis?: {
        host: string
        port: number
        password?: string
        requirePassword: boolean
    }
}
