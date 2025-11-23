import Sentry from "@sentry/nestjs"
import dotenv from "dotenv"
// config dotenv
dotenv.config()
// init sentry
Sentry.init({
    dsn: "https://acf3559f5c5cbbb5195ed6d4216739cd@o4510412601950208.ingest.us.sentry.io/4510412605882368",
    environment: process.env.NODE_ENV,
    // Send structured logs to Sentry
    enableLogs: true,
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transaction
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
})
