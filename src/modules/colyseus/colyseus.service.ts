import { Injectable, OnApplicationBootstrap } from "@nestjs/common"
import { InjectColyseusServer } from "./colyseus.decorators"
import { Server } from "colyseus"
import { envConfig } from "@modules/env"
import { GameRoom } from "./rooms/game"
import { Client } from "colyseus.js"
import { sleep } from "@utils"
import { GameActionReceiveMessage, GameActionSendMessage } from "@modules/colyseus/events"

@Injectable()
export class ColyseusService implements OnApplicationBootstrap {
    constructor(@InjectColyseusServer() private readonly server: Server) {}

    async onApplicationBootstrap() {
        await this.server.listen(envConfig().ports.colyseus)
        console.log(`Colyseus server is running on port ${envConfig().ports.colyseus}`)
        // this.server.define("example", ExampleRoom)
        this.server.define("game", GameRoom)
        sleep(5000).then(() => {
            const client = new Client("ws://localhost:2567")
            client.joinOrCreate("game").then((room) => {
                room.send(GameActionReceiveMessage.BuyPet, {
                    petType: "dog",
                    petTypeId: 1,
                    isBuyPet: true,
                })
                room.onMessage(GameActionSendMessage.BuyPetResponse, (message) => {
                    console.log("🎉 Received buy pet response message:", message)
                })
            })
        })
    }
}
