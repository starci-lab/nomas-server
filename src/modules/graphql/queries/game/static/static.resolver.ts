import { Query, Resolver } from "@nestjs/graphql"
import { UseInterceptors } from "@nestjs/common"
import { StaticService } from "./static.service"
import { GraphQLSuccessMessage } from "../../../interceptors"
import { UseThrottler, ThrottlerConfig } from "@modules/throttler"
import { PetSchema, StoreItemSchema } from "@modules/databases"
import { GraphQLTransformInterceptor } from "../../../interceptors"
import { PetsResponse, StoreItemsResponse } from "./static.dto"

/**
 * Handles static read-only data used by the game.
 *
 * This resolver provides global reference data such as:
 * - Available pet species and their base stats
 * - In-game store items and metadata
 *
 * These queries are throttled and cached since their data
 * changes infrequently and is shared across all users.
 */
@Resolver()
@UseInterceptors(GraphQLTransformInterceptor)
export class StaticResolver {
    constructor(private readonly staticService: StaticService) {}

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("Pets fetched successfully")
    @Query(() => PetsResponse, {
        name: "gamePets",
        description: "Return a full list of supported pet species, including their base stats and income properties.",
    })
    async pets(): Promise<Array<PetSchema>> {
        return this.staticService.pets()
    }

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("Store items fetched successfully")
    @Query(() => StoreItemsResponse, {
        name: "gameStoreItems",
        description: "Return all store items available for purchase, including cost, rarity, and category metadata.",
    })
    async storeItems(): Promise<Array<StoreItemSchema>> {
        return this.staticService.storeItems()
    }
}
