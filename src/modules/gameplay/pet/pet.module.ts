import { Module } from "@nestjs/common"
import { PetGameService } from "./pet.service"
import { ConfigurableModuleClass } from "./pet.module-definition"
import { GameMemdbModule } from "@modules/databases"

@Module({
    imports: [GameMemdbModule],
    providers: [PetGameService],
    exports: [PetGameService],
})
export class GameplayPetModule extends ConfigurableModuleClass {}
