import { Module } from "@nestjs/common"
import { PetEventHandler } from "./pet.event-handler"
import { ConfigurableModuleClass } from "./pet.module-definition"
import { PlayerSyncService } from "../player-sync.service"

@Module({
    providers: [PetEventHandler, PlayerSyncService],
    exports: [PetEventHandler],
})
export class PetHandlersModule extends ConfigurableModuleClass {}
