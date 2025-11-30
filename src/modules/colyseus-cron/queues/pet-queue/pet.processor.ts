import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { QUEUE_NAME } from "../../constants/queue.constants"
import { PetService } from "../../services/pet.service"
import { calculateStatUpdate } from "../../utils/timer"
import { OwnedPetSchema } from "@modules/databases/mongodb/game/schemas"

@Processor(QUEUE_NAME.UPDATE_PET_STATS)
@Injectable()
export class PetProcessor extends WorkerHost {
    private readonly logger = new Logger(PetProcessor.name)

    constructor(private readonly petService: PetService) {
        super()
    }

    async process(job: Job) {
        try {
            this.logger.debug(`Processing job ${job.id}`)

            const pets = await this.petService.findActivePets()
            if (!pets || pets.length === 0) {
                this.logger.debug("No active pets found")
                return []
            }

            for (const pet of pets) {
                const petId = pet.id.toString()
                const ownedPet = pet as unknown as OwnedPetSchema

                const hungerUpdate = calculateStatUpdate(ownedPet.lastUpdateHunger, ownedPet.hunger, 2)
                const happinessUpdate = calculateStatUpdate(ownedPet.lastUpdateHappiness, ownedPet.happiness, 1)
                const cleanlinessUpdate = calculateStatUpdate(ownedPet.lastUpdateCleanliness, ownedPet.cleanliness, 1)

                const newPetStats = {
                    hunger: hungerUpdate.newStat,
                    happiness: happinessUpdate.newStat,
                    cleanliness: cleanlinessUpdate.newStat,
                    lastUpdateHunger: hungerUpdate.newLastUpdate,
                    lastUpdateHappiness: happinessUpdate.newLastUpdate,
                    lastUpdateCleanliness: cleanlinessUpdate.newLastUpdate,
                }

                // Update pet stats
                await this.petService.updateStats(petId, newPetStats)
            }

            this.logger.debug(`Successfully processed job ${job.id}`)
            return pets
        } catch (error) {
            this.logger.error(
                `Error processing pet stats job: ${error instanceof Error ? error.message : "Unknown error"}`,
                error instanceof Error ? error.stack : undefined,
            )
            throw error
        }
    }
}
