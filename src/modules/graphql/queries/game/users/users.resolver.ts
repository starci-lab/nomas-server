import { Args, Query, Resolver } from "@nestjs/graphql"
import { UsersService } from "./users.service"
import { UserSchema } from "@modules/databases"
import { UseInterceptors } from "@nestjs/common"
import { UserResponse } from "./users.dto"
import { UseThrottler, ThrottlerConfig } from "@modules/throttler"
import { GraphQLSuccessMessage, GraphQLTransformInterceptor } from "../../../interceptors"

@Resolver()
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    @UseThrottler(ThrottlerConfig.Soft)
    @GraphQLSuccessMessage("User fetched successfully")
    @Query(() => UserResponse, {
        name: "gameUser",
        description: "Fetch a single user by their unique ID.",
    })
    @UseInterceptors(GraphQLTransformInterceptor)
    async user(
        @Args("id") id: string,
    ): Promise<UserSchema> {
        return this.usersService.user(id)
    }
}