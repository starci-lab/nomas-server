import { Module } from "@nestjs/common"
import { PetHandler } from "./pet.handler"
import { ConfigurableModuleClass } from "./pet.module-definition"
import { PlayerHandlersModule } from "../player/player.module"

@Module({
    imports: [PlayerHandlersModule],
    providers: [PetHandler],
    exports: [PetHandler],
})
export class PetHandlersModule extends ConfigurableModuleClass {}
