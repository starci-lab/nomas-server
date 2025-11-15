import { Room } from "colyseus"
import "reflect-metadata"
import { INestApplication, Logger } from "@nestjs/common"
import { EventEmitterService, EventName } from "@modules/event"
import {
    MESSAGE_HANDLER_METADATA_KEY,
    MESSAGE_EMITTER_METADATA_KEY,
    MessageHandlerMetadata,
    MessageEmitterMetadata,
} from "../decorators/message.decorator"

/**
 * Base class For Colyseus Room with support for decorator-based message handling
 * Automatically register message handlers and event emitters marked with decorators
 */
export abstract class BaseRoom<T extends object = object> extends Room<T> {
    protected readonly logger = new Logger(BaseRoom.name)
    protected readonly app: INestApplication
    public eventEmitterService: EventEmitterService | null = null

    constructor() {
        super()
        this.app = globalThis.__APP__
    }

    /**
     * This method will be called in onCreate to automatically register the decorators
     * Override if you need to add additional logic
     */
    protected registerDecoratedHandlers() {
        this.initializeEventEmitter()

        // Get list of message emitters to know which methods need to emit messages
        const messageEmitters: MessageEmitterMetadata[] =
            Reflect.getMetadata(MESSAGE_EMITTER_METADATA_KEY, this.constructor) || []

        const messageEmitterMap = new Map<string | symbol, string>()
        for (const emitter of messageEmitters) {
            messageEmitterMap.set(emitter.methodName, emitter.messageName)
        }

        // Register message handlers from decorators
        const messageHandlers: MessageHandlerMetadata[] =
            Reflect.getMetadata(MESSAGE_HANDLER_METADATA_KEY, this.constructor) || []

        for (const handler of messageHandlers) {
            const method = (this as Record<string | symbol, unknown>)[handler.methodName]
            if (typeof method === "function") {
                this.onMessage(handler.messageType, async (client, data) => {
                    try {
                        // Bind method with room instance context
                        const boundMethod = method.bind(this) as (client: unknown, data: unknown) => unknown
                        const result = await boundMethod(client, data)

                        // If method has @EmitMessage decorator and has result, emit message
                        const messageName = messageEmitterMap.get(handler.methodName) as EventName
                        if (messageName && this.eventEmitterService && result) {
                            try {
                                await this.eventEmitterService.emit(messageName, result)
                            } catch (emitError) {
                                this.logger.debug(
                                    `Error emitting message ${messageName} from ${String(handler.methodName)}:`,
                                    emitError,
                                )
                            }
                        }
                    } catch (handlerError) {
                        this.logger.debug(
                            `Error handling message ${handler.messageType} in ${String(handler.methodName)}:`,
                            handlerError,
                        )
                    }
                })
            }
        }
    }

    private initializeEventEmitter() {
        try {
            this.eventEmitterService = this.app.get(EventEmitterService, { strict: false })
        } catch {
            this.logger.debug("EventEmitterService not available, event emission will be skipped")
        }
    }
}
