import { Injectable, OnApplicationBootstrap } from "@nestjs/common"
import { InjectColyseusServer } from "./colyseus.decorators"
import { Server } from "colyseus"
import { envConfig } from "@modules/env"
import { ExampleRoom } from "./rooms/example.room"
import { Client } from "colyseus.js"
import { sleep } from "@utils"

@Injectable()
export class ColyseusService implements OnApplicationBootstrap {
    constructor(
        @InjectColyseusServer() private readonly server: Server,
    ) { }

    async onApplicationBootstrap() {
        await this.server.listen(envConfig().ports.colyseus)
        console.log(`Colyseus server is running on port ${envConfig().ports.colyseus}`)
        this.server.define("example", ExampleRoom)
        sleep(5000).then(() => {
            const client = new Client("ws://localhost:2567")
            client.joinOrCreate("example")
        })
    }
}