import { Injectable, Optional, Inject } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { EventName } from "./events"
import { InstanceIdService } from "@modules/mixin"
import { KAFKA_PRODUCER } from "./kafka/constants"
import { CompressionTypes, Producer } from "kafkajs"

export interface EmitOptions {
    withoutKafka?: boolean
    withoutLocal?: boolean
}

@Injectable()
export class EventEmitterService {
    constructor(
        @Optional()
        @Inject(KAFKA_PRODUCER)
        private readonly kafkaProducer: Producer | null,
        private readonly eventEmitter: EventEmitter2,
        private readonly instanceIdService: InstanceIdService,
    ) {}

    async emit<T>(event: EventName | string, payload: T, options?: EmitOptions) {
        // emit locally via event emitter, ensure everything is working locally
        if (!options || !options.withoutLocal) {
            this.eventEmitter.emit(event, payload)
        }
        // emit via kafka, ensure other followers to receive the message
        if ((!options || !options.withoutKafka) && this.kafkaProducer) {
            try {
                return await this.kafkaProducer.send({
                    topic: event,
                    // compress the message to reduce the size of the message
                    compression: CompressionTypes.GZIP,
                    // ensure the message is persisted to the follower
                    // ack = 1 means the message is acknowledged when the leader has written the message to its local log
                    // ack = 0 means the message is acknowledged when the leader has received the message from the producer
                    // ack = -1 means the message is acknowledged when the leader has written the message to its local log and the message is persisted to the follower
                    acks: -1,
                    messages: [
                        {
                            value: JSON.stringify({
                                ...payload,
                                instanceId: this.instanceIdService.getId(),
                            }),
                        },
                    ],
                })
            } catch (error) {
                // Handle Kafka errors gracefully (topic doesn't exist, connection issues, etc.)
                // Log error but don't throw - local event emission already succeeded
                console.warn(
                    `Failed to emit event "${event}" to Kafka:`,
                    error instanceof Error ? error.message : String(error),
                )
                // Return undefined to indicate Kafka emission failed
                return undefined
            }
        }
    }
}
