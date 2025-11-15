import { Client } from "colyseus"
import { GameActionSendMessage, SendWelcomePayload } from "../../events"
import { AbstractReceiverGameRoom } from "./receiver.room"
import { PlayerColyseusSchema } from "../../schemas"

export abstract class AbstractSenderGameRoom extends AbstractReceiverGameRoom {
    protected sendWelcomeMessage(
        client: Client, 
        player: PlayerColyseusSchema
    ) {
        const payload: SendWelcomePayload = {
            message: `Welcome to ${this.state.roomName}, ${player.walletAddress}!`,
            roomId: this.roomId,
        }
        client.send(GameActionSendMessage.Welcome, payload)
    }
}