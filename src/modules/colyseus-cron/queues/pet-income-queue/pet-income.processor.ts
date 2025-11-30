import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { QUEUE_NAME } from "../../constants/queue.constants"
import { PetService } from "../../services/pet.service"
import { getTimeDifferenceInSeconds } from "../../utils/timer"
import { OwnedPetSchema } from "@modules/databases/mongodb/game/schemas"
import { PetSchema } from "@modules/databases/mongodb/game/schemas"

@Processor(QUEUE_NAME.CREATE_INCOME)
@Injectable()
export class PetIncomeProcessor extends WorkerHost {
    private readonly logger = new Logger(PetIncomeProcessor.name)

    constructor(private readonly petService: PetService) {
        super()
    }

    async process(job: Job) {
        try {
            this.logger.debug(`Processing job ${job.id}`)

            const pets = await this.petService.findPetPosibleIncome()

            if (!pets || pets.length === 0) {
                return []
            }

            for (const pet of pets) {
                const petId = pet.id.toString()
                const ownedPet = pet as unknown as OwnedPetSchema
                const petType = ownedPet.type as PetSchema

                if (!petType) {
                    this.logger.debug(`Pet ${petId} has no type populated`)
                    continue
                }

                // Calculate difference in minutes
                const differenceInMinutes = getTimeDifferenceInSeconds(ownedPet.lastClaim) / 60

                // Check if pet should generate income
                if (differenceInMinutes >= petType.timeNatural) {
                    const now = new Date()
                    let incomeCal = Math.floor((differenceInMinutes / petType.timeNatural) * petType.incomePerClaim)

                    // Check if total income would exceed max
                    if (ownedPet.totalIncome + incomeCal > petType.maxIncome) {
                        incomeCal = petType.maxIncome - ownedPet.totalIncome
                    }

                    // Update pet income
                    ownedPet.tokenIncome += incomeCal
                    ownedPet.totalIncome += incomeCal
                    ownedPet.lastClaim = now

                    await ownedPet.save()

                    this.logger.debug(
                        `Pet ${petId} earned ${incomeCal} tokens. Total: ${ownedPet.tokenIncome}/${petType.maxIncomePerClaim}`,
                    )
                }
            }

            this.logger.debug(`Successfully processed job ${job.id}`)
            return pets
        } catch (error) {
            this.logger.error(
                `Error processing pet income job: ${error instanceof Error ? error.message : "Unknown error"}`,
                error instanceof Error ? error.stack : undefined,
            )
            throw error
        }
    }
}
