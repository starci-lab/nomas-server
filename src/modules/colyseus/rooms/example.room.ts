import { Room, Client } from "colyseus"
import { Schema, MapSchema, type } from "@colyseus/schema"
import { INestApplication } from "@nestjs/common"
import { RetryService } from "@modules/mixin"

// State sync: Player structure
export class Player extends Schema {
    @type("number") x: number = 0.11
    @type("number") y: number = 2.22
}

// State sync: State structure
export class State extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>()
}

export class ExampleRoom extends Room<State> {
    private readonly app: INestApplication
    constructor(app: INestApplication) {
        super()
        this.app = globalThis.__APP__
    }
    // initialize empty room state
    state = new State()

    // Colyseus will invoke when creating the room instance
    async onCreate(options: any) {
        const retryService = this.app.get(RetryService)
        console.log(
            await retryService.retry({
                action: async () => {
                    console.log("test")
                    throw new Error("test")
                },
                maxRetries: 5,
                delay: 1000,
            }),
        )
    }

    // Called every time a client joins
    onJoin(client: Client, options: any) {
        this.state.players.set(client.sessionId, new Player())
    }
}
