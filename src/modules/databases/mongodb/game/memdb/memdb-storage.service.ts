import { Injectable, OnModuleInit } from "@nestjs/common"
import { InjectGameMongoose } from "../decorators"
import { Connection } from "mongoose"
import { DefaultInfoSchema, PetSchema, StoreItemSchema } from "../schemas"
import { RetryService } from "@modules/mixin"
import { PetId } from "@modules/databases/mongodb/game/enums"

@Injectable()
export class MemdbStorageService implements OnModuleInit {
    // storage variables
    private pets: Array<PetSchema> = []
    private storeItems: Array<StoreItemSchema> = []
    private defaultInfo: DefaultInfoSchema | null = null

    // constructor
    constructor(
        private readonly retryService: RetryService,
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    async onModuleInit() {
        await Promise.all([this.loadPets(), this.loadStoreItems(), this.loadDefaultInfo()])
    }

    private async loadPets() {
        await this.retryService.retry({
            action: async () => {
                this.pets = await this.connection
                    .model<PetSchema>(PetSchema.name)
                    .find()
                    .lean<Array<PetSchema>>()
                    .exec()
            },
            maxRetries: 50,
            delay: 1000,
        })
    }

    private async loadStoreItems() {
        await this.retryService.retry({
            action: async () => {
                this.storeItems = await this.connection
                    .model<StoreItemSchema>(StoreItemSchema.name)
                    .find()
                    .lean<Array<StoreItemSchema>>()
                    .exec()
            },
            maxRetries: 50,
            delay: 1000,
        })
    }

    private async loadDefaultInfo() {
        await this.retryService.retry({
            action: async () => {
                this.defaultInfo = await this.connection
                    .model<DefaultInfoSchema>(DefaultInfoSchema.name)
                    .find()
                    .lean<DefaultInfoSchema>()
                    .exec()
            },
            maxRetries: 50,
            delay: 1000,
        })
    }

    public getPets(): Array<PetSchema> {
        return this.pets
    }

    public getStoreItems(): Array<StoreItemSchema> {
        return this.storeItems
    }

    public getDefaultInfo(): DefaultInfoSchema {
        return (
            this.defaultInfo || {
                tokenNom: 10000,
                defaultPetId: PetId.Chog,
            }
        )
    }
}
