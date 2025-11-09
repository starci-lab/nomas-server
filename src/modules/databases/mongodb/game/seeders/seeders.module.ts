
import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./seeders.module-definition"
import { SeedersService } from "./seeder.service"
import { PetSeeder, StoreItemSeeder } from "./data"

@Module({
    providers: [
        PetSeeder, 
        StoreItemSeeder,
        SeedersService
    ],
})
export class GameSeedersModule extends ConfigurableModuleClass {}
