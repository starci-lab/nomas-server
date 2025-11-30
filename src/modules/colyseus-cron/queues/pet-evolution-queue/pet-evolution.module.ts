import { Module } from "@nestjs/common"
import { BullModule } from "@modules/bullmq"
import { BullQueueName } from "@modules/bullmq/types"
import { PetEvolutionService } from "./pet-evolution.service"
import { PetModule } from "../../services/pet.module"
import { PetEvolutionQueueEvents } from "./pet-evolution.events"
import { PetEvolutionProcessor } from "./pet-evolution.processor"

@Module({
    imports: [BullModule.registerQueue({ queueName: BullQueueName.PetEvolution }), PetModule],
    providers: [PetEvolutionService, PetEvolutionQueueEvents, PetEvolutionProcessor],
})
export class PetEvolutionQueueModule {}

