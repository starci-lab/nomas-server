import { NestFactory } from "@nestjs/core"
import { CronWorkerModule } from "./app.module"

async function bootstrap() {
    const app = await NestFactory.create(CronWorkerModule)
    await app.listen(process.env.port ?? 3000)
}
bootstrap()
