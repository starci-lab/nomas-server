import { Injectable } from "@nestjs/common"
import { InjectGameMongoose, UserSchema } from "@modules/databases"
import { Connection } from "mongoose"
import { QueryGameUserNotFoundException } from "@exceptions"

@Injectable()
export class UsersService {
    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    async user(id: string): Promise<UserSchema> {
        const user = await this.connection.model<UserSchema>(UserSchema.name).findById(id)
        if (!user) {
            throw new QueryGameUserNotFoundException("Game user not found")
        }
        return user
    }   
}