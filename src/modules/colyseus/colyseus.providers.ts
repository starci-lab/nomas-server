import { Provider } from "@nestjs/common"
import { Server } from "colyseus"
import { COLYSEUS_SERVER } from "./constants"
import { createServer } from "http"
import { HttpAdapterHost } from "@nestjs/core"
import { WebSocketTransport } from "@colyseus/ws-transport"

export const createColyseusServerProvider = (): Provider<
  Server
> => ({
    provide: COLYSEUS_SERVER,
    inject: [HttpAdapterHost],
    useFactory: (httpAdapterHost: HttpAdapterHost) => {
        const server = new Server({
            server: createServer(httpAdapterHost.httpAdapter.getInstance()),
            transport: new WebSocketTransport({
                server: createServer(httpAdapterHost.httpAdapter.getInstance()),
                pingInterval: 10000,
                pingMaxRetries: 3,
            }),
        })
        return server
    },
})