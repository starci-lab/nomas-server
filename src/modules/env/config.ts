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
        game: {
            host: process.env.REDIS_GAME_HOST || "localhost",
            port: process.env.REDIS_GAME_PORT || 6380,
            username: process.env.REDIS_GAME_USERNAME || "default",
            password: process.env.REDIS_GAME_PASSWORD || "Cuong123_A",
            requirePassword: process.env.REDIS_GAME_REQUIRE_PASSWORD || false,
        },
    },
    ports: {
        core: process.env.PORT ?? 3000,
    },
    isProduction: process.env.NODE_ENV === "production",
})
