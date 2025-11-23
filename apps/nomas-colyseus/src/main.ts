import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app"
import "dotenv/config"
import "@modules/sentry/instrument"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    globalThis.__APP__ = app
    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
