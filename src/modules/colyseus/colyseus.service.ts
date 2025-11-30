import { Injectable, OnApplicationBootstrap } from "@nestjs/common"
import { InjectColyseusServer } from "./colyseus.decorators"
import { Server } from "colyseus"
import { envConfig } from "@modules/env"
import { GameRoom } from "./rooms/game"

@Injectable()
export class ColyseusService implements OnApplicationBootstrap {
    constructor(@InjectColyseusServer() private readonly server: Server) {}

    async onApplicationBootstrap() {
        await this.server.listen(envConfig().ports.colyseus)
        console.log(`Colyseus server is running on port ${envConfig().ports.colyseus}`)
        this.server.define("game", GameRoom)
    }
}
