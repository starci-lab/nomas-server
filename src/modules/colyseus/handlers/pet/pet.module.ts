import { forwardRef, Module } from "@nestjs/common"
import { PetHandler } from "./pet.handler"
import { ConfigurableModuleClass } from "./pet.module-definition"
import { PlayerHandlersModule } from "../player/player.module"
import { PetSyncService } from "./pet-sync.service"

@Module({
    imports: [forwardRef(() => PlayerHandlersModule)],
    providers: [PetHandler, PetSyncService],
    exports: [PetHandler, PetSyncService],
})
export class PetHandlersModule extends ConfigurableModuleClass {}
