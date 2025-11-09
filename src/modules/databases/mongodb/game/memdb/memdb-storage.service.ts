import { Injectable, OnModuleInit } from "@nestjs/common"
import { InjectGameMongoose } from "../decorators"
import { Connection } from "mongoose"
import { PetSchema, StoreItemSchema } from "../schemas"
import { RetryService } from "@modules/mixin"

@Injectable()
export class MemdbStorageService implements OnModuleInit {
    // storage variables
    private pets: Array<PetSchema> = []
    private storeItems: Array<StoreItemSchema> = []
    
    // constructor
    constructor(
    private readonly retryService: RetryService,
    @InjectGameMongoose()
    private readonly connection: Connection,
    ) {}

    async onModuleInit() {
        await Promise.all([this.loadPets(), this.loadStoreItems()])
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
}
