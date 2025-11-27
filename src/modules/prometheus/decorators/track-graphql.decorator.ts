import { TrackMetric } from "./track-metric.decorator"
import { MetricNames } from "../constants/metric-names"

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
export function TrackGraphQL(options?: TrackGraphQLOptions) {
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

        // Apply request counter tracking
        const requestCounterDecorator = TrackMetric({
            metricName: MetricNames.GRAPHQL_REQUESTS_TOTAL,
            type: "counter",
            labels: [
                () => ({
                    operation_type: operationType!,
                    operation_name: operationName,
                }),
            ],
            trackErrors,
        })
        requestCounterDecorator(target, propertyKey, descriptor)

        // Apply duration histogram tracking
        const durationHistogramDecorator = TrackMetric({
            metricName: MetricNames.GRAPHQL_REQUESTS_DURATION_SECONDS,
            type: "histogram",
            trackDuration: true,
            labels: [
                () => ({
                    operation_type: operationType!,
                    operation_name: operationName,
                }),
            ],
        })
        durationHistogramDecorator(target, propertyKey, descriptor)

        // Error tracking is handled by the counter decorator
        return descriptor
    }
}
