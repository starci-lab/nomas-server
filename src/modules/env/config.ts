export const envConfig = () => ({
    mongodb: {
        game: {
            host: process.env.MONGODB_GAME_HOST || "localhost",
            port: process.env.MONGODB_GAME_PORT || 27019,
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
        },
    },
    ports: {
        core: process.env.PORT ?? 3000,
    },
    isProduction: process.env.NODE_ENV === "production",
})
