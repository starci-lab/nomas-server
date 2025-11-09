import { Injectable } from "@nestjs/common"
import { 
    PetSchema,
    StoreItemSchema
} from "@modules/databases"
import { MemdbStorageService } from "@modules/databases"

@Injectable()
export class StaticService {
    constructor(
        private readonly memDbStorageService: MemdbStorageService,
    ) {}

    pets(): Array<PetSchema> {
        return this.memDbStorageService.getPets()
    }

    storeItems(): Array<StoreItemSchema> {
        return this.memDbStorageService.getStoreItems()
    }
}