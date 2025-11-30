import { Module } from "@nestjs/common"
import { BullModule } from "@modules/bullmq"
import { BullQueueName } from "@modules/bullmq/types"
import { PetIncomeService } from "./pet-income.service"
import { PetModule } from "../../services/pet.module"
import { PetIncomeQueueEvents } from "./pet-income.events"
import { PetIncomeProcessor } from "./pet-income.processor"

@Module({
    imports: [BullModule.registerQueue({ queueName: BullQueueName.PetIncome }), PetModule],
    providers: [PetIncomeService, PetIncomeQueueEvents, PetIncomeProcessor],
})
export class PetIncomeQueueModule {}

