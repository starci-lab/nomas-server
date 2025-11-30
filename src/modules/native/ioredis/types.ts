import { Cluster, Redis } from "ioredis"

export interface IoRedisOptions {
    // Whether to use a Redis cluster
    useCluster?: boolean
    // The host of the Redis server
    host: string
    // The port of the Redis server
    port: number
    // The password of the Redis server
    password?: string
    // Whether to require a password
    requirePassword: boolean
    // Additional instance keys
    additionalInstanceKeys?: Array<string>
    // The max retries per request
    maxRetriesPerRequest?: number | null
}

export type RedisOrCluster = Redis | Cluster
