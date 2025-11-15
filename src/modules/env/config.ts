import { Platform } from "@typedefs"

export const envConfig = () => ({
    mongodb: {
        game: {
            host: process.env.MONGODB_GAME_HOST || "localhost",
            port: process.env.MONGODB_GAME_PORT || 27018,
            database: process.env.MONGODB_GAME_DATABASE || "game",
            username: process.env.MONGODB_GAME_USERNAME || "root",
            password: process.env.MONGODB_GAME_PASSWORD || "Cuong123_A",
        },
    },
    redis: {
        colyseus: {
            host: process.env.REDIS_COLYSEUS_HOST || "localhost",
            port: process.env.REDIS_COLYSEUS_PORT ? Number.parseInt(process.env.REDIS_COLYSEUS_PORT) : 6379,
            username: process.env.REDIS_COLYSEUS_USERNAME || "default",
            password: process.env.REDIS_COLYSEUS_PASSWORD || "Cuong123_A",
            requirePassword: process.env.REDIS_COLYSEUS_REQUIRE_PASSWORD === "true",
        },
        throttler: {
            host: process.env.REDIS_THROTTLER_HOST || "localhost",
            port: process.env.REDIS_THROTTLER_PORT ? Number.parseInt(process.env.REDIS_THROTTLER_PORT) : 6379,
            username: process.env.REDIS_THROTTLER_USERNAME || "default",
            password: process.env.REDIS_THROTTLER_PASSWORD || "Cuong123_A",
            requirePassword: process.env.REDIS_THROTTLER_REQUIRE_PASSWORD === "true",
        },
        cache: {
            host: process.env.REDIS_CACHE_HOST || "localhost",
            port: process.env.REDIS_CACHE_PORT ? Number.parseInt(process.env.REDIS_CACHE_PORT) : 6379,
            username: process.env.REDIS_CACHE_USERNAME || "default",
            password: process.env.REDIS_CACHE_PASSWORD || "Cuong123_A",
            requirePassword: process.env.REDIS_CACHE_REQUIRE_PASSWORD === "true",
            ttl: process.env.REDIS_CACHE_TTL ? Number.parseInt(process.env.REDIS_CACHE_TTL) : 60 * 60 * 24, // 24 hours
        },
    },
    secret: {
        jwt: process.env.JWT_SECRET || "secret",
    },
    ports: {
        core: process.env.PORT ?? 3000,
        colyseus: process.env.COLYSEUS_PORT ? Number.parseInt(process.env.COLYSEUS_PORT) : 2567,
    },
    kafka: {
        host: process.env.KAFKA_HOST || "localhost",
        port: process.env.KAFKA_PORT ? Number.parseInt(process.env.KAFKA_PORT) : 9092,
        clientId: process.env.KAFKA_CLIENT_ID || "kafka",
        sasl: {
            mechanism: process.env.KAFKA_SASL_MECHANISM || "plain" as "plain" | "scram-sha-256",
            username: process.env.KAFKA_SASL_USERNAME || "kafka",
            password: process.env.KAFKA_SASL_PASSWORD || "Cuong123_A",
            enabled: process.env.KAFKA_SASL_ENABLED === "true",
        },
    },
    isProduction: process.env.NODE_ENV === "production",
    // mock private keys for testing
    mockPrivateKeys: {
        [Platform.Evm]:
            process.env.MOCK_PRIVATE_KEY_EVM || "b243401a4c59ba95ec01939edbf269e6d78f1c5ac55e7a704705761ca6c56448",
        [Platform.Solana]:
            process.env.MOCK_PRIVATE_KEY_SOLANA || "3132333435363738393031323334353637383930313233343536373839303132",
        [Platform.Sui]:
            process.env.MOCK_PRIVATE_KEY_SUI || "0x0000000000000000000000000000000000000000000000000000000000000000",
        [Platform.Aptos]:
            process.env.MOCK_PRIVATE_KEY_APTOS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    auth: {
        signature: {
            duration: process.env.AUTH_SIGNATURE_DURATION
                ? Number.parseInt(process.env.AUTH_SIGNATURE_DURATION)
                : 60 * 60 * 24, // 24 hours
        },
    },
    loki: {
        host: process.env.LOKI_HOST || "http://localhost:3100",
    },
})
