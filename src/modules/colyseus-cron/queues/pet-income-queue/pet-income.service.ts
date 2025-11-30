import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { Job, Queue } from "bullmq"
import { JOB_ID, QUEUE_NAME } from "../../constants/queue.constants"

interface PetIncomeJobData {
    petId: string
}

@Injectable()
export class PetIncomeService implements OnModuleInit {
    private readonly logger = new Logger(PetIncomeService.name)

    constructor(@InjectQueue(QUEUE_NAME.CREATE_INCOME) private createIncomeQueue: Queue) {}

    async onModuleInit() {
        // Initialize create income jobs
        await this.initializeCreateIncomeJobs()
    }

    private async initializeCreateIncomeJobs() {
        try {
            await this.addCreateIncomePetJob()
            this.logger.log(`Initialized create income pets jobs`)
        } catch (error) {
            this.logger.error("Failed to initialize create income jobs", error)
        }
    }

    async addCreateIncomePetJob() {
        try {
            const jobId = JOB_ID.CREATE_INCOME
            const existingJob = (await this.createIncomeQueue.getJob(jobId)) as
                | Job<PetIncomeJobData>
                | undefined

            if (existingJob) {
                this.logger.debug(`Create income pet job already exists`)
                return
            }

            await this.createIncomeQueue.add(
                QUEUE_NAME.CREATE_INCOME,
                {},
                {
                    jobId,
                    repeat: {
                        // Update every 1 minute
                        every: 1000 * 60,
                    },
                    // Add cleanup options for repeat jobs
                    removeOnComplete: 5, // Keep only 5 completed instances
                    removeOnFail: 3, // Keep only 3 failed instances
                },
            )

            this.logger.log(`Added create income job`)
        } catch (error) {
            this.logger.error("Failed to add create income pet job", error)
        }
    }

    async removeCreateIncomeJob() {
        try {
            const jobId = JOB_ID.CREATE_INCOME
            await this.createIncomeQueue.removeRepeatable(QUEUE_NAME.CREATE_INCOME, {
                jobId,
                // Update every 1 minute
                every: 1000 * 60,
            })
            this.logger.log(`Removed create income job`)
        } catch (error) {
            this.logger.error(`Failed to remove create income job`, error)
            throw error
        }
    }

    async getCreateIncomeJobStatus() {
        const jobId = JOB_ID.CREATE_INCOME
        const job = (await this.createIncomeQueue.getJob(jobId)) as Job<PetIncomeJobData> | undefined
        return job ? await job.getState() : null
    }
}

