import { Room } from "colyseus"
import { INestApplication, Logger } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { DayjsService, RetryService } from "@modules/mixin"

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
    }
}
