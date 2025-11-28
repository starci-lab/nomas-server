import "reflect-metadata"
import { PrometheusService } from "../providers/prometheus.service"
import { Logger } from "@nestjs/common"

type LabelExtractor = (args: unknown[], result?: unknown) => Record<string, string | number>

interface NestAppLike {
    get<T = unknown>(token: unknown, options?: { strict?: boolean }): T
}

interface GlobalAppContext {
    __APP__?: NestAppLike
}

export interface TrackMetricOptions {
    /**
     * Metric name from MetricNames constant
     */
    metricName: string
    /**
     * Type of metric: 'counter' or 'histogram'
     * @default 'counter'
     */
    type?: "counter" | "histogram"
    /**
     * Whether to track duration (only for histogram)
     * @default false
     */
    trackDuration?: boolean
    /**
     * Label names to extract from method arguments or return value
     * Labels can be:
     * - String: property path in arguments (e.g., 'petType', 'payload.petType')
     * - Function: extractor function that receives (args, result) and returns label values
     */
    labels?: Array<string | LabelExtractor>
    /**
     * Increment value for counter (default: 1)
     */
    incrementValue?: number
    /**
     * Track errors separately
     * @default false
     */
    trackErrors?: boolean
    /**
     * Error metric name (if different from main metric)
     */
    errorMetricName?: string
}

const PROMETHEUS_SERVICE_KEY = Symbol("prometheus:service")

/**
 * Generic decorator to track metrics (counter or histogram)
 *
 * @example
 * ```typescript
 * @TrackMetric({
 *   metricName: MetricNames.PET_BOUGHT_TOTAL,
 *   labels: ['petType']
 * })
 * async handleBuyPet(payload: { petType: string }) { ... }
 *
 * @TrackMetric({
 *   metricName: MetricNames.ACTION_DURATION_SECONDS,
 *   type: 'histogram',
 *   trackDuration: true,
 *   labels: ['action_type']
 * })
 * async handleAction(actionType: string) { ... }
 * ```
 */
export function TrackMetric(options: TrackMetricOptions) {
    const logger = new Logger(TrackMetric.name)
    return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown> | unknown
        const metricType = options.type || "counter"
        const trackDuration = options.trackDuration || false

        descriptor.value = async function (...args: unknown[]) {
            // Get PrometheusService from DI container
            let prometheusService: PrometheusService | undefined

            // Try to get from global app context
            try {
                const app = (globalThis as GlobalAppContext).__APP__
                if (app) {
                    prometheusService = app.get(PrometheusService, { strict: false })
                }
            } catch {
                // Service not available, skip tracking
            }

            // Try to get from injected property
            if (!prometheusService) {
                const injectedService = (this as Record<symbol, PrometheusService | undefined>)[PROMETHEUS_SERVICE_KEY]
                if (injectedService) {
                    prometheusService = injectedService
                }
            }

            if (!prometheusService) {
                // If service not available, just execute original method
                return originalMethod.apply(this, args)
            }

            const startTime = trackDuration ? Date.now() : undefined
            let labels: Record<string, string | number> = {}

            // Extract labels from arguments (wrap in try-catch to prevent errors from breaking method execution)
            try {
                if (options.labels && options.labels.length > 0) {
                    for (const label of options.labels) {
                        try {
                            if (typeof label === "string") {
                                // Extract from arguments by property path
                                const value = extractValueFromArgs(args, label)
                                if (value !== undefined) {
                                    // Convert property path to label name (e.g., 'petType' -> 'pet_type')
                                    const labelName =
                                        label
                                            .split(".")
                                            .pop()
                                            ?.replace(/([A-Z])/g, "_$1")
                                            .toLowerCase() || label
                                    labels[labelName] = String(value)
                                }
                            } else if (typeof label === "function") {
                                // Use extractor function
                                const extractedLabels = label(args)
                                labels = { ...labels, ...extractedLabels }
                            }
                        } catch (labelError) {
                            // Log label extraction error but continue with other labels
                            logger.error(`Error extracting label for metric ${options.metricName}:`, labelError)
                        }
                    }
                }
            } catch (labelExtractionError) {
                // Log label extraction error but don't fail the method
                logger.error(`Error during label extraction for metric ${options.metricName}:`, labelExtractionError)
                // Continue with empty labels - method execution should not be affected
            }

            try {
                const result = await originalMethod.apply(this, args)

                // Track success metric (wrap in try-catch to prevent tracking errors from affecting the result)
                try {
                    if (metricType === "counter") {
                        prometheusService.incrementCounter(options.metricName, labels, options.incrementValue || 1)
                    } else if (metricType === "histogram") {
                        if (trackDuration && startTime) {
                            const duration = (Date.now() - startTime) / 1000 // Convert to seconds
                            prometheusService.observeHistogram(options.metricName, duration, labels)
                        }
                    }
                } catch (trackingError) {
                    // Log tracking error but don't affect the method result
                    logger.error(`Error tracking metric ${options.metricName}:`, trackingError)
                }

                // Always return the original method's result (defensive check to ensure we never lose the return value)
                // Note: result can be null/undefined if that's what the original method returns, which is valid
                return result
            } catch (error) {
                // Track error if enabled (wrap in try-catch to prevent tracking errors from affecting the original error)
                if (options.trackErrors) {
                    try {
                        const errorMetricName =
                            options.errorMetricName || options.metricName.replace("_total", "_errors_total")
                        prometheusService.incrementCounter(errorMetricName, {
                            ...labels,
                            error_type: error?.constructor?.name || "UnknownError",
                        })
                    } catch (trackingError) {
                        // Log tracking error but don't affect the original error
                        logger.error(`Error tracking error metric for ${options.metricName}:`, trackingError)
                    }
                }

                throw error
            }
        }

        return descriptor
    }
}

/**
 * Helper function to extract value from arguments by property path
 * Supports nested paths like 'payload.petType'
 */
function extractValueFromArgs(args: unknown[], path: string): unknown {
    if (!args || args.length === 0) {
        return undefined
    }

    const parts = path.split(".")
    let value: unknown = args

    for (const part of parts) {
        if (Array.isArray(value)) {
            // If it's an array, try to find the value in any object
            for (const item of value) {
                if (item && typeof item === "object") {
                    const recordItem = item as Record<string, unknown>
                    if (part in recordItem) {
                        value = recordItem[part]
                        break
                    }
                }
            }
            if (Array.isArray(value)) {
                return undefined
            }
        } else if (value && typeof value === "object") {
            const recordValue = value as Record<string, unknown>
            if (part in recordValue) {
                value = recordValue[part]
            } else {
                return undefined
            }
        } else {
            return undefined
        }
    }

    return value
}
