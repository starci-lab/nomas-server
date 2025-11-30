import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { PetService } from "./pet.service"
import {
    OwnedPetSchema,
    OwnedPetSchemaClass,
    PetSchema,
    PetSchemaClass,
} from "@modules/databases/mongodb/game/schemas"
import { GAME_MONGOOSE_CONNECTION_NAME } from "@modules/databases/mongodb/game/constants"

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                { name: OwnedPetSchema.name, schema: OwnedPetSchemaClass },
                { name: PetSchema.name, schema: PetSchemaClass },
            ],
            GAME_MONGOOSE_CONNECTION_NAME,
        ),
    ],
    providers: [PetService],
    exports: [PetService],
})
export class PetModule {}

