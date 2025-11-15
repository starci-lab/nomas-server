import { GameActionReceiveMessage, GameActionRequestMessage, ReceiveBuyPetPayload } from "@modules/colyseus/events"
import { AbstractStateManagementGameRoom } from "./state-management.room"
import { Client } from "colyseus"

export interface RegisterHandler {
    messageType: GameActionReceiveMessage
    handler: (client: Client, data: unknown) => void
}
export abstract class AbstractReceiverGameRoom extends AbstractStateManagementGameRoom {
    protected readonly registers: Array<RegisterHandler> = 
        [
            {
                messageType: GameActionReceiveMessage.BuyPet,
                handler: (
                    client: Client, 
                    data: ReceiveBuyPetPayload
                ) => {
                    this.eventEmitter.emit(GameActionRequestMessage.BuyPet, {
                        client,
                        data,
                    })
                }
            }
        ]

    protected registerReceiverHandlers() {
        this.registers.forEach((register) => {
            this.onMessage(register.messageType, register.handler)
        })
    }
}   