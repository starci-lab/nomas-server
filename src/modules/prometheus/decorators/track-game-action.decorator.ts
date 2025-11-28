import { TrackMetric, TrackMetricOptions } from "./track-metric.decorator"
import { MetricNames } from "../constants/metric-names"

export interface TrackGameActionOptions {
    /**
     * Whether to track duration
     * @default false
     */
    trackDuration?: boolean
    /**
     * Label extractors - property paths in the method arguments
     * Common labels: 'petType', 'foodType', 'itemType', 'itemName'
     */
    labels?: string[]
    /**
     * Track errors separately
     * @default true
     */
    trackErrors?: boolean
}

/**
 * Specialized decorator for tracking game actions
 * Automatically maps to appropriate metrics and handles common patterns
 *
 * @example
 * ```typescript
 * @TrackGameAction('pet_bought', { labels: ['petType'] })
 * async handleBuyPet(payload: { petType: string }) { ... }
 *
 * @TrackGameAction('pet_fed', {
 *   labels: ['foodType'],
 *   trackDuration: true
 * })
 * async handleFeedPet(payload: { foodType: string }) { ... }
 * ```
 */
export function TrackGameAction(actionName: string, options?: TrackGameActionOptions) {
    const opts: TrackGameActionOptions = options ?? {}
    const trackDuration = opts.trackDuration ?? false
    const trackErrors = opts.trackErrors ?? true

    // Map action names to metric names
    const metricNameMap: Record<string, string> = {
        pet_bought: MetricNames.PET_BOUGHT_TOTAL,
        pet_removed: MetricNames.PET_REMOVED_TOTAL,
        pet_fed: MetricNames.PET_FED_TOTAL,
        pet_played: MetricNames.PET_PLAYED_TOTAL,
        pet_cleaned: MetricNames.PET_CLEANED_TOTAL,
        pet_poop_created: MetricNames.PET_POOP_CREATED_TOTAL,
        item_purchased: MetricNames.ITEM_PURCHASED_TOTAL,
        food_purchased: MetricNames.FOOD_PURCHASED_TOTAL,
        tokens_spent: MetricNames.TOKENS_SPENT_TOTAL,
    }

    const metricName = metricNameMap[actionName] || MetricNames.ACTION_DURATION_SECONDS

    const trackOptions: TrackMetricOptions = {
        metricName: trackDuration ? MetricNames.ACTION_DURATION_SECONDS : metricName,
        type: trackDuration ? "histogram" : "counter",
        trackDuration,
        labels: opts.labels || [],
        trackErrors,
    }

    // If tracking duration, also track the counter
    if (trackDuration && metricName !== MetricNames.ACTION_DURATION_SECONDS) {
        // We'll need to track both counter and histogram
        // For now, we'll use a wrapper approach
        return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
            // Apply counter tracking
            const counterDecorator = TrackMetric({
                metricName,
                type: "counter",
                labels: opts.labels || [],
                trackErrors,
            })
            counterDecorator(target, propertyKey, descriptor)

            // Apply histogram tracking
            const histogramDecorator = TrackMetric({
                metricName: MetricNames.ACTION_DURATION_SECONDS,
                type: "histogram",
                trackDuration: true,
                labels: [() => ({ action_type: actionName }), ...(opts.labels || []).map((label) => label)],
            })
            histogramDecorator(target, propertyKey, descriptor)
        }
    }

    return TrackMetric(trackOptions)
}
