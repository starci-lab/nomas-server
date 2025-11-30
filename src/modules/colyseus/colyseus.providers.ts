import { Provider } from "@nestjs/common"
import { Server } from "colyseus"
import { COLYSEUS_SERVER } from "./constants"
import { createServer } from "http"
import { HttpAdapterHost } from "@nestjs/core"
import { WebSocketTransport } from "@colyseus/ws-transport"
import { monitor } from "@colyseus/monitor"
import { playground } from "@colyseus/playground"
import basicAuth from "express-basic-auth"
import { envConfig } from "@modules/env"

export const createColyseusServerProvider = (): Provider<Server> => ({
    provide: COLYSEUS_SERVER,
    inject: [HttpAdapterHost],
    useFactory: (httpAdapterHost: HttpAdapterHost) => {
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

        const server = new Server({
            server: createServer(app),
            transport: new WebSocketTransport({
                server: createServer(app),
                pingInterval: 10000,
                pingMaxRetries: 3,
            }),
        })
        return server
    },
})
