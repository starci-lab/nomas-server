import { Provider } from "@nestjs/common"
import { RedisPresence, Server } from "colyseus"
import { RedisDriver } from "@colyseus/redis-driver"
import { COLYSEUS_SERVER } from "./constants"
import { createServer } from "http"
import { HttpAdapterHost } from "@nestjs/core"
import { WebSocketTransport } from "@colyseus/ws-transport"
import { monitor } from "@colyseus/monitor"
import { playground } from "@colyseus/playground"
import basicAuth from "express-basic-auth"
import { envConfig } from "@modules/env"
import { Logger } from "winston"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./colyseus.module-definition"
import { RedisOptions } from "ioredis"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"

export const createColyseusServerProvider = (): Provider<Server> => ({
    provide: COLYSEUS_SERVER,
    inject: [HttpAdapterHost, WINSTON_MODULE_PROVIDER, MODULE_OPTIONS_TOKEN],
    useFactory: (httpAdapterHost: HttpAdapterHost, logger: Logger, options: typeof OPTIONS_TYPE) => {
        const app = httpAdapterHost.httpAdapter.getInstance()
        // Add Colyseus monitor panel
        const basicAuthMiddleware = basicAuth({
            // list of users and passwords
            users: {
                [envConfig().redis.colyseus.adminUsername]: envConfig().redis.colyseus.adminPassword,
            },
            // sends WWW-Authenticate header, which will prompt the user to fill
            // credentials in
            challenge: true,
        })
        app.use("/monitor", basicAuthMiddleware, monitor())
        app.use("/playground", basicAuthMiddleware, playground())

        // Configure Redis driver if enabled
        let driver: RedisDriver | undefined
        if (options.useRedisDriver) {
            const redisConfig = options.redis ?? envConfig().redis.colyseus
            const redisOptions: RedisOptions = {
                host: redisConfig.host,
                port: redisConfig.port,
                password: redisConfig.requirePassword ? redisConfig.password : undefined,
            }
            driver = new RedisDriver(redisOptions)
        }

        // Configure Redis presence if enabled
        let presence: RedisPresence | undefined
        if (options.useRedisPresence) {
            const redisConfig = options.redis ?? envConfig().redis.colyseus
            const redisOptions: RedisOptions = {
                host: redisConfig.host,
                port: redisConfig.port,
                password: redisConfig.requirePassword ? redisConfig.password : undefined,
            }
            presence = new RedisPresence(redisOptions)
        }

        const server = new Server({
            server: createServer(app),
            transport: new WebSocketTransport({
                server: createServer(app),
                pingInterval: 10000,
                pingMaxRetries: 3,
            }),
            driver,
            presence,
            logger,
        })
        return server
    },
})
