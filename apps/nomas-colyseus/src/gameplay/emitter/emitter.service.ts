import { Injectable, Logger } from "@nestjs/common"
import { EventEmitterService } from "@modules/event"
import { EventName } from "@modules/event/events"

/**
 * Bridge service between Colyseus rooms and event system
 * Acts as an intermediary layer to handle event emission and routing
 */
@Injectable()
export class EmitterService {
    private readonly logger = new Logger(EmitterService.name)

    constructor(private readonly eventEmitterService: EventEmitterService) {}

    /**
     * Emit an event through the event system (local + Kafka if available)
     * This is the main bridge method for emitting events from Colyseus rooms
     */
    async emit<T>(event: EventName | string, payload: T, options?: { withoutKafka?: boolean; withoutLocal?: boolean }) {
        try {
            // Cast to EventName if it's a string (for backward compatibility)
            const eventName = typeof event === "string" ? (event as EventName) : event
            await this.eventEmitterService.emit(eventName, payload, options)
            this.logger.debug(`Event emitted: ${event}`)
        } catch (error) {
            this.logger.error(`Failed to emit event ${event}:`, error instanceof Error ? error.message : String(error))
            throw error
        }
    }

    /**
     * Emit a game-specific event (wrapper for convenience)
     */
    async emitGameEvent<T>(event: string, payload: T) {
        return this.emit(event, payload)
    }

    /**
     * Sync response method - can be extended for specific sync operations
     */
    public syncResponse<TData = undefined>(data?: TData) {
        // This method can be extended to handle specific sync operations
        // For example: syncing game state, player data, etc.
        return {
            success: true,
            message: "Sync response successful",
            data,
        }
    }
}
