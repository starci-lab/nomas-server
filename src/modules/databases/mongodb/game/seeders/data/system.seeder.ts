import { Injectable, Logger } from "@nestjs/common"
import { SystemSchema } from "../../schemas"
import { DeepPartial } from "@typedefs"
import { Connection } from "mongoose"
import { InjectGameMongoose } from "../../decorators"
import { Seeder } from "nestjs-seeder"
import { SeederException } from "@exceptions"
import { PetId, PetName, SystemId } from "../../enums"
import { createObjectId } from "@utils"

const data: Array<DeepPartial<SystemSchema>> = [
    {
        _id: createObjectId(SystemId.DefaultInfo),
        displayId: SystemId.DefaultInfo,
        value: {
            tokenNom: 10000,
            defaultPetId: PetId.Chog,
            defaultPetName: PetName.Chog,
        },
    },
]

@Injectable()
export class SystemSeeder implements Seeder {
    private readonly logger = new Logger(SystemSeeder.name)

    constructor(
        @InjectGameMongoose()
        private readonly connection: Connection,
    ) {}

    public async seed(): Promise<void> {
        await this.drop()
        await this.connection.model<SystemSchema>(SystemSchema.name).create(data)
    }

    async drop(): Promise<void> {
        try {
            await this.connection.model<SystemSchema>(SystemSchema.name).deleteMany({})
        } catch (error) {
            this.logger.debug(error)
            throw new SeederException("Failed to drop systems")
        }
    }
}
