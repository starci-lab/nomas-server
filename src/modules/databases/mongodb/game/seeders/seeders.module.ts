import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./seeders.module-definition"
import { SeedersService } from "./seeder.service"
import { PetSeeder, StoreItemSeeder, SystemSeeder } from "./data"

@Module({
    providers: [PetSeeder, StoreItemSeeder, SystemSeeder, SeedersService],
})
export class GameSeedersModule extends ConfigurableModuleClass {}
