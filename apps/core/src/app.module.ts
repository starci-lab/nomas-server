import { Module } from "@nestjs/common"
import { GameMongooseModule } from "@modules/databases"

@Module({
    imports: [
        // we require mongodb for the core module
        GameMongooseModule.forRoot({
            isGlobal: true,
            withSeeder: true,
            loadToMemory: true,
        }),
    ],
})
export class AppModule {}
