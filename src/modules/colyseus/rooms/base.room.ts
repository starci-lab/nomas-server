import { Room } from "colyseus"
import { INestApplication, Logger } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { DayjsService, RetryService } from "@modules/mixin"
import { ROOM_EVENT_LISTENER_METADATA_KEY, RoomEventListenerMetadata } from "../decorators"
import { JwtEphemeralService } from "@modules/jwt"

/**
 * Base class For Colyseus Room with support for decorator-based message handling
 * Automatically register message handlers and event emitters marked with decorators
 */
export abstract class BaseRoom<T extends object = object> extends Room<T> {
    protected readonly logger = new Logger(BaseRoom.name)
    protected readonly app: INestApplication
    protected eventEmitter: EventEmitter2
    protected retryService: RetryService | null = null
    protected dayjsService: DayjsService
    protected jwtService: JwtEphemeralService | null = null

    constructor() {
        super()
        this.app = globalThis.__APP__
    }

    /**
     * This method will be called in onCreate to automatically register the decorators
     * Override if you need to add additional logic
     */
    protected initialize() {
        this.eventEmitter = this.app.get(EventEmitter2, { strict: false })
        this.dayjsService = this.app.get(DayjsService, { strict: false })
        this.retryService = this.app.get(RetryService, { strict: false })
        this.jwtService = this.app.get(JwtEphemeralService, { strict: false })

        // Automatically register event listeners marked with @OnRoomEvent decorator
        this.registerRoomEventListeners()
    }

    /**
     * Automatically register all methods marked with @OnRoomEvent decorator
     */
    private registerRoomEventListeners() {
        const listeners: Array<RoomEventListenerMetadata> =
            Reflect.getMetadata(ROOM_EVENT_LISTENER_METADATA_KEY, this.constructor) || []

        listeners.forEach((listener) => {
            const method = this[listener.methodName as keyof this]
            if (typeof method === "function") {
                this.eventEmitter.on(listener.eventName, method.bind(this))
                this.logger.debug(`Registered event listener: ${listener.eventName} -> ${String(listener.methodName)}`)
            }
        })
    }
}
