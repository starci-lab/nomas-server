import { Module } from "@nestjs/common"
import { PetEventHandler } from "./pet.event-handler"
import { ConfigurableModuleClass } from "./pet.module-definition"
import { PlayerHandlersModule } from "../player/player.module"

@Module({
    imports: [PlayerHandlersModule],
    providers: [PetEventHandler],
    exports: [PetEventHandler],
})
export class PetHandlersModule extends ConfigurableModuleClass {}
