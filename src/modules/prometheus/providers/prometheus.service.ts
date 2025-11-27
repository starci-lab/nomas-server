import { Injectable, Logger } from "@nestjs/common"
import { InjectMetric } from "@willsoto/nestjs-prometheus"
import { Counter, Gauge, Histogram } from "prom-client"
import { MetricNames } from "../constants/metric-names"

/**
 * PrometheusService provides a convenient interface for tracking metrics
 * All metrics should be accessed through this service
 */
@Injectable()
export class PrometheusService {
    private readonly logger = new Logger(PrometheusService.name)

    constructor(
        // Room Metrics
        @InjectMetric(MetricNames.ROOM_ACTIVE_TOTAL)
        private readonly roomActiveGauge: Gauge<string>,
        @InjectMetric(MetricNames.ROOM_CREATED_TOTAL)
        private readonly roomCreatedCounter: Counter<string>,
        @InjectMetric(MetricNames.ROOM_DISPOSED_TOTAL)
        private readonly roomDisposedCounter: Counter<string>,
        @InjectMetric(MetricNames.ROOM_PLAYERS_CURRENT)
        private readonly roomPlayersGauge: Gauge<string>,
        @InjectMetric(MetricNames.ROOM_MAX_CAPACITY_USAGE)
        private readonly roomMaxCapacityGauge: Gauge<string>,

        // Player Metrics
        @InjectMetric(MetricNames.PLAYER_JOINED_TOTAL)
        private readonly playerJoinedCounter: Counter<string>,
        @InjectMetric(MetricNames.PLAYER_LEFT_TOTAL)
        private readonly playerLeftCounter: Counter<string>,
        @InjectMetric(MetricNames.PLAYER_RECONNECTED_TOTAL)
        private readonly playerReconnectedCounter: Counter<string>,
        @InjectMetric(MetricNames.PLAYER_ACTIVE_CURRENT)
        private readonly playerActiveGauge: Gauge<string>,

        // Pet Actions Metrics
        @InjectMetric(MetricNames.PET_BOUGHT_TOTAL)
        private readonly petBoughtCounter: Counter<string>,
        @InjectMetric(MetricNames.PET_REMOVED_TOTAL)
        private readonly petRemovedCounter: Counter<string>,
        @InjectMetric(MetricNames.PET_FED_TOTAL)
        private readonly petFedCounter: Counter<string>,
        @InjectMetric(MetricNames.PET_PLAYED_TOTAL)
        private readonly petPlayedCounter: Counter<string>,
        @InjectMetric(MetricNames.PET_CLEANED_TOTAL)
        private readonly petCleanedCounter: Counter<string>,
        @InjectMetric(MetricNames.PET_POOP_CREATED_TOTAL)
        private readonly petPoopCreatedCounter: Counter<string>,

        // Inventory & Store Metrics
        @InjectMetric(MetricNames.ITEM_PURCHASED_TOTAL)
        private readonly itemPurchasedCounter: Counter<string>,
        @InjectMetric(MetricNames.FOOD_PURCHASED_TOTAL)
        private readonly foodPurchasedCounter: Counter<string>,
        @InjectMetric(MetricNames.TOKENS_SPENT_TOTAL)
        private readonly tokensSpentCounter: Counter<string>,

        // GraphQL Metrics
        @InjectMetric(MetricNames.GRAPHQL_REQUESTS_TOTAL)
        private readonly graphqlRequestsCounter: Counter<string>,
        @InjectMetric(MetricNames.GRAPHQL_REQUESTS_DURATION_SECONDS)
        private readonly graphqlRequestsDuration: Histogram<string>,
        @InjectMetric(MetricNames.GRAPHQL_ERRORS_TOTAL)
        private readonly graphqlErrorsCounter: Counter<string>,

        // Performance Metrics
        @InjectMetric(MetricNames.ACTION_DURATION_SECONDS)
        private readonly actionDurationHistogram: Histogram<string>,
        @InjectMetric(MetricNames.DATABASE_QUERY_DURATION_SECONDS)
        private readonly databaseQueryDurationHistogram: Histogram<string>,
        @InjectMetric(MetricNames.CACHE_HIT_TOTAL)
        private readonly cacheHitCounter: Counter<string>,
        @InjectMetric(MetricNames.CACHE_MISS_TOTAL)
        private readonly cacheMissCounter: Counter<string>,

        // Error Metrics
        @InjectMetric(MetricNames.ERRORS_TOTAL)
        private readonly errorsCounter: Counter<string>,
        @InjectMetric(MetricNames.ACTION_FAILURES_TOTAL)
        private readonly actionFailuresCounter: Counter<string>,

        // System Metrics
        @InjectMetric(MetricNames.EVENT_EMITTED_TOTAL)
        private readonly eventEmittedCounter: Counter<string>,
        @InjectMetric(MetricNames.KAFKA_MESSAGES_PUBLISHED_TOTAL)
        private readonly kafkaMessagesPublishedCounter: Counter<string>,
        @InjectMetric(MetricNames.KAFKA_MESSAGES_CONSUMED_TOTAL)
        private readonly kafkaMessagesConsumedCounter: Counter<string>,
    ) {}

    // Room Metrics
    incrementRoomCreated(): void {
        this.roomCreatedCounter.inc()
        this.roomActiveGauge.inc()
    }

    incrementRoomDisposed(): void {
        this.roomDisposedCounter.inc()
        this.roomActiveGauge.dec()
    }

    setRoomPlayers(count: number): void {
        this.roomPlayersGauge.set(count)
    }

    setRoomMaxCapacityUsage(percentage: number): void {
        this.roomMaxCapacityGauge.set(percentage)
    }

    // Player Metrics
    incrementPlayerJoined(): void {
        this.playerJoinedCounter.inc()
        this.playerActiveGauge.inc()
    }

    incrementPlayerLeft(): void {
        this.playerLeftCounter.inc()
        this.playerActiveGauge.dec()
    }

    incrementPlayerReconnected(): void {
        this.playerReconnectedCounter.inc()
    }

    // Pet Actions Metrics
    incrementPetBought(petType: string): void {
        this.petBoughtCounter.inc({ pet_type: petType })
    }

    incrementPetRemoved(): void {
        this.petRemovedCounter.inc()
    }

    incrementPetFed(foodType: string): void {
        this.petFedCounter.inc({ food_type: foodType })
    }

    incrementPetPlayed(): void {
        this.petPlayedCounter.inc()
    }

    incrementPetCleaned(): void {
        this.petCleanedCounter.inc()
    }

    incrementPetPoopCreated(): void {
        this.petPoopCreatedCounter.inc()
    }

    // Inventory & Store Metrics
    incrementItemPurchased(itemType: string, itemName: string): void {
        this.itemPurchasedCounter.inc({ item_type: itemType, item_name: itemName })
    }

    incrementFoodPurchased(foodType: string): void {
        this.foodPurchasedCounter.inc({ food_type: foodType })
    }

    incrementTokensSpent(actionType: string, amount: number = 1): void {
        this.tokensSpentCounter.inc({ action_type: actionType }, amount)
    }

    // GraphQL Metrics
    incrementGraphQLRequest(operationType: string, operationName: string): void {
        this.graphqlRequestsCounter.inc({ operation_type: operationType, operation_name: operationName })
    }

    recordGraphQLDuration(operationType: string, operationName: string, durationSeconds: number): void {
        this.graphqlRequestsDuration.observe(
            { operation_type: operationType, operation_name: operationName },
            durationSeconds,
        )
    }

    incrementGraphQLError(operationType: string, errorType: string): void {
        this.graphqlErrorsCounter.inc({ operation_type: operationType, error_type: errorType })
    }

    // Performance Metrics
    recordActionDuration(actionType: string, durationSeconds: number): void {
        this.actionDurationHistogram.observe({ action_type: actionType }, durationSeconds)
    }

    recordDatabaseQueryDuration(collection: string, operation: string, durationSeconds: number): void {
        this.databaseQueryDurationHistogram.observe({ collection, operation }, durationSeconds)
    }

    incrementCacheHit(): void {
        this.cacheHitCounter.inc()
    }

    incrementCacheMiss(): void {
        this.cacheMissCounter.inc()
    }

    // Error Metrics
    incrementError(errorType: string, service: string): void {
        this.errorsCounter.inc({ error_type: errorType, service })
    }

    incrementActionFailure(actionType: string, reason: string): void {
        this.actionFailuresCounter.inc({ action_type: actionType, reason })
    }

    // System Metrics
    incrementEventEmitted(eventType: string): void {
        this.eventEmittedCounter.inc({ event_type: eventType })
    }

    incrementKafkaMessagesPublished(): void {
        this.kafkaMessagesPublishedCounter.inc()
    }

    incrementKafkaMessagesConsumed(): void {
        this.kafkaMessagesConsumedCounter.inc()
    }

    // Generic methods for decorators
    incrementCounter(metricName: string, labels?: Record<string, string | number>, value: number = 1): void {
        try {
            const counter = this.getCounter(metricName)
            if (counter) {
                counter.inc(labels ?? {}, value)
            }
        } catch (error) {
            this.logger.warn(`Failed to increment counter ${metricName}:`, error)
        }
    }

    observeHistogram(metricName: string, value: number, labels?: Record<string, string | number>): void {
        try {
            const histogram = this.getHistogram(metricName)
            if (histogram) {
                histogram.observe(labels ?? {}, value)
            }
        } catch (error) {
            this.logger.warn(`Failed to observe histogram ${metricName}:`, error)
        }
    }

    setGauge(metricName: string, value: number, labels?: Record<string, string | number>): void {
        try {
            const gauge = this.getGauge(metricName)
            if (gauge) {
                gauge.set(labels ?? {}, value)
            }
        } catch (error) {
            this.logger.warn(`Failed to set gauge ${metricName}:`, error)
        }
    }

    private getCounter(metricName: string): Counter<string> | null {
        const metricMap: Record<string, Counter<string>> = {
            [MetricNames.ROOM_CREATED_TOTAL]: this.roomCreatedCounter,
            [MetricNames.ROOM_DISPOSED_TOTAL]: this.roomDisposedCounter,
            [MetricNames.PLAYER_JOINED_TOTAL]: this.playerJoinedCounter,
            [MetricNames.PLAYER_LEFT_TOTAL]: this.playerLeftCounter,
            [MetricNames.PLAYER_RECONNECTED_TOTAL]: this.playerReconnectedCounter,
            [MetricNames.PET_BOUGHT_TOTAL]: this.petBoughtCounter,
            [MetricNames.PET_REMOVED_TOTAL]: this.petRemovedCounter,
            [MetricNames.PET_FED_TOTAL]: this.petFedCounter,
            [MetricNames.PET_PLAYED_TOTAL]: this.petPlayedCounter,
            [MetricNames.PET_CLEANED_TOTAL]: this.petCleanedCounter,
            [MetricNames.PET_POOP_CREATED_TOTAL]: this.petPoopCreatedCounter,
            [MetricNames.ITEM_PURCHASED_TOTAL]: this.itemPurchasedCounter,
            [MetricNames.FOOD_PURCHASED_TOTAL]: this.foodPurchasedCounter,
            [MetricNames.TOKENS_SPENT_TOTAL]: this.tokensSpentCounter,
            [MetricNames.GRAPHQL_REQUESTS_TOTAL]: this.graphqlRequestsCounter,
            [MetricNames.GRAPHQL_ERRORS_TOTAL]: this.graphqlErrorsCounter,
            [MetricNames.CACHE_HIT_TOTAL]: this.cacheHitCounter,
            [MetricNames.CACHE_MISS_TOTAL]: this.cacheMissCounter,
            [MetricNames.ERRORS_TOTAL]: this.errorsCounter,
            [MetricNames.ACTION_FAILURES_TOTAL]: this.actionFailuresCounter,
            [MetricNames.EVENT_EMITTED_TOTAL]: this.eventEmittedCounter,
            [MetricNames.KAFKA_MESSAGES_PUBLISHED_TOTAL]: this.kafkaMessagesPublishedCounter,
            [MetricNames.KAFKA_MESSAGES_CONSUMED_TOTAL]: this.kafkaMessagesConsumedCounter,
        }
        return metricMap[metricName] || null
    }

    private getHistogram(metricName: string): Histogram<string> | null {
        const metricMap: Record<string, Histogram<string>> = {
            [MetricNames.GRAPHQL_REQUESTS_DURATION_SECONDS]: this.graphqlRequestsDuration,
            [MetricNames.ACTION_DURATION_SECONDS]: this.actionDurationHistogram,
            [MetricNames.DATABASE_QUERY_DURATION_SECONDS]: this.databaseQueryDurationHistogram,
        }
        return metricMap[metricName] || null
    }

    private getGauge(metricName: string): Gauge<string> | null {
        const metricMap: Record<string, Gauge<string>> = {
            [MetricNames.ROOM_ACTIVE_TOTAL]: this.roomActiveGauge,
            [MetricNames.ROOM_PLAYERS_CURRENT]: this.roomPlayersGauge,
            [MetricNames.ROOM_MAX_CAPACITY_USAGE]: this.roomMaxCapacityGauge,
            [MetricNames.PLAYER_ACTIVE_CURRENT]: this.playerActiveGauge,
        }
        return metricMap[metricName] || null
    }
}
