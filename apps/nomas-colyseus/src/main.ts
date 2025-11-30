import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app"
import "dotenv/config"
import "@modules/sentry/instrument"
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston"
import { envConfig } from "@modules/env"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    console.log("envConfig().kafka", envConfig().kafka)
    globalThis.__APP__ = app
    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
