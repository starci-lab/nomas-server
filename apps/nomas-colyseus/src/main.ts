import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app"
import "dotenv/config"
import "@modules/sentry/instrument"
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    globalThis.__APP__ = app
    app.enableCors({
        origin: true, // Allow all origins in development (change to specific origins in production)
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    })
    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
