import { Module } from "@nestjs/common"
import { GameplayPetModule } from "@modules/gameplay"
import { PetService } from "./pet.message-handlers"
import { PetEventHandler } from "./pet.service."

@Module({
    imports: [GameplayPetModule],
    providers: [PetService, PetEventHandler],
    exports: [PetService, PetEventHandler],
})
export class PetHandlersModule {}
