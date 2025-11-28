import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { PetSeeder, StoreItemSeeder, SystemSeeder } from "./data"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./seeders.module-definition"
import { Inject } from "@nestjs/common"

@Injectable()
export class SeedersService implements OnModuleInit {
    private readonly logger = new Logger(SeedersService.name)
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: typeof OPTIONS_TYPE,
        private readonly petSeeder: PetSeeder,
        private readonly storeItemSeeder: StoreItemSeeder,
        private readonly systemSeeder: SystemSeeder,
    ) {}

    async onModuleInit() {
        // we do nothing if manual trigger is enabled
        if (this.options.manualTrigger) {
            return
        }
        await this.seed()
    }

    /**
     * Trigger the seeding process manually
     */
    public async trigger() {
        await this.seed()
    }

    private async seed() {
        await Promise.all([
            (async () => {
                await this.petSeeder.drop()
                await this.petSeeder.seed()
            })(),
            (async () => {
                await this.storeItemSeeder.drop()
                await this.storeItemSeeder.seed()
            })(),
            (async () => {
                await this.systemSeeder.drop()
                await this.systemSeeder.seed()
            })(),
        ])
    }
}
