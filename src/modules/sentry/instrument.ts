// import { envConfig } from "@modules/env"
import Sentry from "@sentry/nestjs"
import "dotenv/config"
// init sentry
Sentry.init({
    dsn: "https://acf3559f5c5cbbb5195ed6d4216739cd@o4510412601950208.ingest.us.sentry.io/4510412605882368",
    environment: process.env.NODE_ENV,
    // Send structured logs to Sentry
    enableLogs: true,
    // Add Performance Monitoring by setting tracesSampleRate
    // The value is automatically adjusted depending on the environment
    // Learn more about sampling here: https://docs.sentry.io/platforms/javascript/guides/nestjs/configuration/sampling/
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // tracesSampleRate: 1.0,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
})
