import { Module } from "@nestjs/common"
import { BullModule } from "@modules/bullmq"
import { BullQueueName } from "@modules/bullmq/types"
import { PetQueueService } from "./pet-queue.service"
import { PetModule } from "../../services/pet.module"
import { PetQueueEvents } from "./pet-queue.events"
import { PetProcessor } from "./pet.processor"

@Module({
    imports: [BullModule.registerQueue({ queueName: BullQueueName.Pet }), PetModule],
    providers: [PetQueueService, PetQueueEvents, PetProcessor],
})
export class PetQueueModule {}

