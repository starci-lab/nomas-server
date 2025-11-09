import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./memdb.module-definition"
import { MemdbStorageService } from "./memdb-storage.service"

@Module({
    providers: [
        MemdbStorageService
    ],
    exports: [
        MemdbStorageService
    ]
})
export class GameMemdbModule extends ConfigurableModuleClass {
}