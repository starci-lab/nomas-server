import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@modules/env"

const bootstrap = async () => {
    const app = await NestFactory.create(
        AppModule, {
        logger: envConfig().isProduction ? ["error", "log"] : undefined,
    })
    globalThis.__APP__ = app
    await app.listen(envConfig().ports.core)
}
bootstrap()
