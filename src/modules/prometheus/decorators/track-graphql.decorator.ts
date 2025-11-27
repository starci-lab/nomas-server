import { PrometheusService } from "../providers/prometheus.service"
import { MetricNames } from "../constants/metric-names"
import { Logger } from "@nestjs/common"

const PROMETHEUS_SERVICE_KEY = Symbol("prometheus:service")

export interface TrackGraphQLOptions {
    /**
     * Operation type: 'query' or 'mutation'
     * If not provided, will try to infer from method name or metadata
     */
    operationType?: "query" | "mutation"
    /**
     * Operation name (e.g., 'requestColyseusEphemeralJwt')
     * If not provided, will use method name
     */
    operationName?: string
    /**
     * Track errors separately
     * @default true
     */
    trackErrors?: boolean
}

/**
 * Decorator for tracking GraphQL operations
 * Automatically tracks requests, duration, and errors
 * Uses a single wrap to avoid double-wrapping issues
 *
 * @example
 * ```typescript
 * @TrackGraphQL({ operationType: 'mutation' })
 * @Mutation(() => RequestColyseusEphemeralJwtResponse)
 * async requestColyseusEphemeralJwt(...) { ... }
 *
 * @TrackGraphQL({ operationType: 'query' })
 * @Query(() => UserResponse)
 * async getUser(...) { ... }
 * ```
 */
interface NestAppLike {
    get<T = unknown>(token: unknown, options?: { strict?: boolean }): T
}

interface GlobalAppContext {
    __APP__?: NestAppLike
}

export function TrackGraphQL(options?: TrackGraphQLOptions) {
    const logger = new Logger(TrackGraphQL.name)
    const opts = options || {}
    const trackErrors = opts.trackErrors !== false // Default to true

    return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        // Get operation name from method name or options
        const operationName = opts.operationName || String(propertyKey)

        // Try to infer operation type from method name or metadata
        let operationType = opts.operationType
        if (!operationType) {
            const methodName = String(propertyKey).toLowerCase()
            if (methodName.includes("query") || methodName.startsWith("get") || methodName.startsWith("find")) {
                operationType = "query"
            } else {
                operationType = "mutation"
            }
        }

        // Store original method
        const originalMethod = descriptor.value

        // Create labels once
        const labels = {
            operation_type: operationType!,
            operation_name: operationName,
        }

        // Single wrapper that handles both counter and histogram tracking
        descriptor.value = async function (...args: unknown[]) {
            // Get PrometheusService from DI container
            let prometheusService: PrometheusService | undefined

            // Try to get from global app context
            try {
                const app = (globalThis as GlobalAppContext).__APP__
                if (app) {
                    prometheusService = app.get(PrometheusService, { strict: false })
                } else {
                    logger.warn(
                        `[TrackGraphQL] globalThis.__APP__ is not available for ${operationName}. Metrics will not be tracked.`,
                    )
                }
            } catch (error) {
                // Service not available, log for debugging
                logger.warn(
                    `[TrackGraphQL] Failed to get PrometheusService from global context for ${operationName}:`,
                    error,
                )
            }

            // Try to get from injected property
            if (!prometheusService && this[PROMETHEUS_SERVICE_KEY]) {
                prometheusService = this[PROMETHEUS_SERVICE_KEY]
            }

            // If service not available, just execute original method and await the result
            if (!prometheusService) {
                logger.warn(
                    `[TrackGraphQL] PrometheusService not available for ${operationName}. Method will execute without tracking.`,
                )
                return await originalMethod.apply(this, args)
            }

            const startTime = Date.now()

            try {
                // Execute original method
                const result = await originalMethod.apply(this, args)

                // Track success metrics (wrap in try-catch to prevent tracking errors from affecting the result)
                try {
                    // Track counter metric
                    prometheusService.incrementCounter(MetricNames.GRAPHQL_REQUESTS_TOTAL, labels, 1)

                    // Track duration histogram
                    const duration = (Date.now() - startTime) / 1000 // Convert to seconds
                    prometheusService.observeHistogram(MetricNames.GRAPHQL_REQUESTS_DURATION_SECONDS, duration, labels)
                } catch (trackingError) {
                    // Log tracking error but don't affect the method result
                    logger.error(`Error tracking GraphQL metrics for ${operationName}:`, trackingError)
                }

                // Always return the original method's result (defensive check to ensure we never lose the return value)
                // Note: result can be null/undefined if that's what the original method returns, which is valid
                // But we need to ensure we're returning the actual value, not a Promise
                return result
            } catch (error) {
                // Track error if enabled (wrap in try-catch to prevent tracking errors from affecting the original error)
                if (trackErrors) {
                    try {
                        const errorMetricName = MetricNames.GRAPHQL_REQUESTS_TOTAL.replace("_total", "_errors_total")
                        prometheusService.incrementCounter(errorMetricName, {
                            ...labels,
                            error_type: error?.constructor?.name || "UnknownError",
                        })
                    } catch (trackingError) {
                        // Log tracking error but don't affect the original error
                        this.logger.error(`Error tracking error metric for ${operationName}:`, trackingError)
                    }
                }

                // Re-throw the original error
                throw error
            }
        }

        return descriptor
    }
}
