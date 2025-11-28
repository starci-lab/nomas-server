import { Provider } from "@nestjs/common"
import { Server } from "colyseus"
import { COLYSEUS_SERVER } from "./constants"
import { createServer } from "http"
import { HttpAdapterHost } from "@nestjs/core"
import { WebSocketTransport } from "@colyseus/ws-transport"
import { monitor } from "@colyseus/monitor"
import { playground } from "@colyseus/playground"

export const createColyseusServerProvider = (): Provider<Server> => ({
    provide: COLYSEUS_SERVER,
    inject: [HttpAdapterHost],
    useFactory: (httpAdapterHost: HttpAdapterHost) => {
        const app = httpAdapterHost.httpAdapter.getInstance()
        // Add Colyseus monitor panel
        app.use("/monitor", monitor())
        app.use("/playground", playground())

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
