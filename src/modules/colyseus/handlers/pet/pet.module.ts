import { Module } from "@nestjs/common"
import { GameplayModule } from "@modules/gameplay"
import { PetEventHandler } from "./pet.event-handler"
import { ConfigurableModuleClass } from "./pet.module-definition"

@Module({
    imports: [GameplayModule.register({})],
    providers: [PetEventHandler],
    exports: [PetEventHandler],
})
export class PetHandlersModule extends ConfigurableModuleClass {}
