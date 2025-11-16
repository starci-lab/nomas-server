import { Module } from "@nestjs/common"
import { GameplayPetModule } from "@modules/gameplay"
import { PetEventHandler } from "./pet.event-handler"

@Module({
    imports: [GameplayPetModule],
    providers: [PetEventHandler],
    exports: [PetEventHandler],
})
export class PetHandlersModule {}
