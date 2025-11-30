import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { QUEUE_NAME } from "../../constants/queue.constants"
import { PetService } from "../../services/pet.service"
import { getTimeDifferenceInSeconds } from "../../utils/timer"
import { OwnedPetSchema } from "@modules/databases/mongodb/game/schemas"
import { PetSchema } from "@modules/databases/mongodb/game/schemas"

@Processor(QUEUE_NAME.UPDATE_EVOLUTION)
@Injectable()
export class PetEvolutionProcessor extends WorkerHost {
    private readonly logger = new Logger(PetEvolutionProcessor.name)

    constructor(private readonly petService: PetService) {
        super()
    }

    async process(job: Job) {
        try {
            this.logger.log(`Processing job ${job.id}`)

            const pets = await this.petService.findPetYoungPets()

            if (!pets || pets.length === 0) {
                return []
            }

            for (const pet of pets) {
                const petId = pet.id.toString()
                const ownedPet = pet as unknown as OwnedPetSchema
                const petType = ownedPet.type as PetSchema

                if (!petType) {
                    this.logger.warn(`Pet ${petId} has no type populated`)
                    continue
                }

                // Calculate difference in minutes
                const differenceInMinutes = getTimeDifferenceInSeconds(ownedPet.lastClaim) / 60

                // Check if pet should evolve to adult
                if (differenceInMinutes >= petType.timeNatural) {
                    await this.petService.updatePetAdult(petId)
                    this.logger.log(`Pet ${petId} evolved to adult`)
                }
            }

            this.logger.log(`Successfully processed job ${job.id}`)
            return pets
        } catch (error) {
            this.logger.error(
                `Error processing pet evolution job: ${error instanceof Error ? error.message : "Unknown error"}`,
                error instanceof Error ? error.stack : undefined,
            )
            throw error
        }
    }
}
