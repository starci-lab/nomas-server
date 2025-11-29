import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./game.module-definition"
import { MongooseModule as NestMongooseModule } from "@nestjs/mongoose"
import {
    UserSchema,
    UserSchemaClass,
    PetSchema,
    PetSchemaClass,
    OwnedPetSchema,
    OwnedPetSchemaClass,
    PoopSchema,
    PoopSchemaClass,
    StoreItemSchema,
    StoreItemSchemaClass,
    SystemSchema,
    SystemSchemaClass,
    SessionSchema,
    SessionSchemaClass,
} from "./schemas"
import { Connection } from "mongoose"
import { envConfig } from "@modules/env"
import { GameSeedersModule } from "./seeders"
import { GAME_MONGOOSE_CONNECTION_NAME } from "./constants"
import { GameMemdbModule } from "./memdb"

@Module({})
export class GameMongooseModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const { withSeeder, manualTrigger, loadToMemory, isGlobal } = options
        const dynamicModule = super.forRoot(options)
        const { database, username, password, host, port } = envConfig().mongodb.game
        const url = `mongodb://${username}:${password}@${host}:${port}`

        const imports = [
            NestMongooseModule.forRoot(url, {
                retryWrites: true,
                retryReads: true,
                authSource: "admin",
                dbName: database,
                connectionName: GAME_MONGOOSE_CONNECTION_NAME,
            }),
            this.forFeature(),
        ]
        if (withSeeder) {
            imports.push(
                GameSeedersModule.register({
                    manualTrigger: manualTrigger,
                    isGlobal,
                }),
            )
        }
        if (loadToMemory) {
            imports.push(
                GameMemdbModule.register({
                    isGlobal,
                }),
            )
        }
        return {
            ...dynamicModule,
            imports,
        }
    }

    private static forFeature(): DynamicModule {
        return {
            module: GameMongooseModule,
            imports: [
                NestMongooseModule.forFeatureAsync(
                    [
                        {
                            name: UserSchema.name,
                            useFactory: (connection: Connection) => {
                                // middleware register for deleteMany
                                UserSchemaClass.pre("deleteMany", async function (next) {
                                    const { $in } = this.getFilter()._id
                                    await connection.model<OwnedPetSchema>(OwnedPetSchema.name).deleteMany({
                                        user: { $in: $in },
                                    })
                                    next()
                                })
                                // middleware register for deleteOne
                                UserSchemaClass.pre("deleteOne", async function (next) {
                                    const { _id } = this.getFilter()
                                    await connection.model<OwnedPetSchema>(OwnedPetSchema.name).deleteMany({
                                        user: _id,
                                    })
                                    next()
                                })
                                return UserSchemaClass
                            },
                        },
                        {
                            name: PetSchema.name,
                            useFactory: () => PetSchemaClass,
                        },
                        {
                            name: OwnedPetSchema.name,
                            useFactory: () => OwnedPetSchemaClass,
                        },
                        {
                            name: PoopSchema.name,
                            useFactory: () => PoopSchemaClass,
                        },
                        {
                            name: StoreItemSchema.name,
                            useFactory: () => StoreItemSchemaClass,
                        },
                        {
                            name: SystemSchema.name,
                            useFactory: () => SystemSchemaClass,
                        },
                        {
                            name: SessionSchema.name,
                            useFactory: () => SessionSchemaClass,
                        },
                    ],
                    GAME_MONGOOSE_CONNECTION_NAME,
                ),
            ],
        }
    }
}
