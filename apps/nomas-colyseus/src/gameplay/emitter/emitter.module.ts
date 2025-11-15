import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./emitter.module-definition"
import { EmitterService } from "./emitter.service"
import { PetEmitterModule } from "./pet"

@Module({
    imports: [PetEmitterModule],
    // re-export for convenience
    exports: [EmitterService],
    providers: [EmitterService],
})
export class EmitterModule extends ConfigurableModuleClass {}
