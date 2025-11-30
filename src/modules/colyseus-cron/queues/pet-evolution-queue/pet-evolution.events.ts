import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { QUEUE_NAME } from "../../constants/queue.constants"

@QueueEventsListener(QUEUE_NAME.UPDATE_EVOLUTION, {
    blockingTimeout: 3000,
})
@Injectable()
export class PetEvolutionQueueEvents extends QueueEventsHost {
    private readonly logger = new Logger(PetEvolutionQueueEvents.name)

    @OnQueueEvent("added")
    onAdded(job: { jobId: string; name: string }) {
        this.logger.debug(`Job ${job.jobId} of type ${job.name} has been added to the queue`)
    }

    @OnQueueEvent("waiting")
    onWaiting(job: { jobId: string; prev?: string }) {
        this.logger.debug(`Job ${job.jobId} is waiting`)
    }

    @OnQueueEvent("completed")
    onCompleted(job: { jobId: string }) {
        this.logger.debug(`Job ${job.jobId} has been completed`)
    }

    @OnQueueEvent("failed")
    onFailed(job: { jobId: string; failedReason: string }) {
        this.logger.error(`Job ${job.jobId} has failed: ${job.failedReason}`, job.failedReason)
    }
}
