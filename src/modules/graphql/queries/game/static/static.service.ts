import { Injectable } from "@nestjs/common"
import { PetSchema, StoreItemSchema } from "@modules/databases"
import { MemdbStorageService } from "@modules/databases"
import { QueryGameStaticNotFoundException } from "@exceptions"
// import { QueryGameStaticNotFoundException } from "@exceptions"

@Injectable()
export class StaticService {
    constructor(private readonly memDbStorageService: MemdbStorageService) {}

    pets(): Array<PetSchema> {
        throw new QueryGameStaticNotFoundException("Pets not found")
        return this.memDbStorageService.getPets()
    }

    storeItems(): Array<StoreItemSchema> {
        return this.memDbStorageService.getStoreItems()
    }
}
