import "reflect-metadata"
import { GameActionResponseMessage } from "../events"

export const MESSAGE_HANDLER_METADATA_KEY = "colyseus:message_handlers"
export const MESSAGE_EMITTER_METADATA_KEY = "colyseus:message_emitters"

export interface MessageHandlerMetadata {
    messageType: string
    methodName: string | symbol
}

export interface MessageEmitterMetadata {
    messageName: string
    methodName: string | symbol
}

/**
 * Decorator to automatically register message handler
 * @param messageType - Type of message from client (e.g. "buy_pet", "feed_pet")
 */
export const OnMessage = (messageType: GameActionResponseMessage) => {
    return function (target: object, propertyKey: string | symbol) {
        const existingHandlers: Array<MessageHandlerMetadata> =
            Reflect.getMetadata(MESSAGE_HANDLER_METADATA_KEY, target.constructor) || []

        existingHandlers.push({
            messageType,
            methodName: propertyKey,
        })

        Reflect.defineMetadata(MESSAGE_HANDLER_METADATA_KEY, existingHandlers, target.constructor)
    }
}

/**
 * Decorator to automatically emit message after method is called
 * @param messageName - Name of message to emit (e.g. "game.pet.buyRequested")
 */
export const EmitMessage = (messageName: string) => {
    return function (target: object, propertyKey: string | symbol) {
        const existingEmitters: Array<MessageEmitterMetadata> =
            Reflect.getMetadata(MESSAGE_EMITTER_METADATA_KEY, target.constructor) || []

        existingEmitters.push({
            messageName,
            methodName: propertyKey,
        })

        Reflect.defineMetadata(MESSAGE_EMITTER_METADATA_KEY, existingEmitters, target.constructor)
    }
}
