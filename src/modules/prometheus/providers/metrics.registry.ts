import { Provider } from "@nestjs/common"
import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from "@willsoto/nestjs-prometheus"
import { MetricNames } from "../constants/metric-names"

/**
 * Centralized metrics registry
 * All metrics are registered here as providers
 */
export const MetricsProviders: Provider[] = [
    // Room Metrics
    makeGaugeProvider({
        name: MetricNames.ROOM_ACTIVE_TOTAL,
        help: "Number of active game rooms",
    }),
    makeCounterProvider({
        name: MetricNames.ROOM_CREATED_TOTAL,
        help: "Total number of game rooms created",
    }),
    makeCounterProvider({
        name: MetricNames.ROOM_DISPOSED_TOTAL,
        help: "Total number of game rooms disposed",
    }),
    makeGaugeProvider({
        name: MetricNames.ROOM_PLAYERS_CURRENT,
        help: "Current number of players in rooms",
    }),
    makeGaugeProvider({
        name: MetricNames.ROOM_MAX_CAPACITY_USAGE,
        help: "Percentage of room max capacity usage",
    }),

    // Player Metrics
    makeCounterProvider({
        name: MetricNames.PLAYER_JOINED_TOTAL,
        help: "Total number of player joins",
    }),
    makeCounterProvider({
        name: MetricNames.PLAYER_LEFT_TOTAL,
        help: "Total number of player leaves",
    }),
    makeCounterProvider({
        name: MetricNames.PLAYER_RECONNECTED_TOTAL,
        help: "Total number of player reconnections",
    }),
    makeGaugeProvider({
        name: MetricNames.PLAYER_ACTIVE_CURRENT,
        help: "Current number of active players",
    }),

    // Pet Actions Metrics
    makeCounterProvider({
        name: MetricNames.PET_BOUGHT_TOTAL,
        help: "Total number of pets bought",
        labelNames: ["pet_type"],
    }),
    makeCounterProvider({
        name: MetricNames.PET_REMOVED_TOTAL,
        help: "Total number of pets removed",
    }),
    makeCounterProvider({
        name: MetricNames.PET_FED_TOTAL,
        help: "Total number of pet feeds",
        labelNames: ["food_type"],
    }),
    makeCounterProvider({
        name: MetricNames.PET_PLAYED_TOTAL,
        help: "Total number of pet plays",
    }),
    makeCounterProvider({
        name: MetricNames.PET_CLEANED_TOTAL,
        help: "Total number of pet cleans",
    }),
    makeCounterProvider({
        name: MetricNames.PET_POOP_CREATED_TOTAL,
        help: "Total number of poops created",
    }),

    // Inventory & Store Metrics
    makeCounterProvider({
        name: MetricNames.ITEM_PURCHASED_TOTAL,
        help: "Total number of items purchased",
        labelNames: ["item_type", "item_name"],
    }),
    makeCounterProvider({
        name: MetricNames.FOOD_PURCHASED_TOTAL,
        help: "Total number of food items purchased",
        labelNames: ["food_type"],
    }),
    makeCounterProvider({
        name: MetricNames.TOKENS_SPENT_TOTAL,
        help: "Total tokens spent",
        labelNames: ["action_type"],
    }),

    // GraphQL Metrics
    makeCounterProvider({
        name: MetricNames.GRAPHQL_REQUESTS_TOTAL,
        help: "Total number of GraphQL requests",
        labelNames: ["operation_type", "operation_name"],
    }),
    makeHistogramProvider({
        name: MetricNames.GRAPHQL_REQUESTS_DURATION_SECONDS,
        help: "GraphQL request duration in seconds",
        labelNames: ["operation_type", "operation_name"],
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    }),
    makeCounterProvider({
        name: MetricNames.GRAPHQL_ERRORS_TOTAL,
        help: "Total number of GraphQL errors",
        labelNames: ["operation_type", "error_type"],
    }),

    // Performance Metrics
    makeHistogramProvider({
        name: MetricNames.ACTION_DURATION_SECONDS,
        help: "Game action duration in seconds",
        labelNames: ["action_type"],
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    }),
    makeHistogramProvider({
        name: MetricNames.DATABASE_QUERY_DURATION_SECONDS,
        help: "Database query duration in seconds",
        labelNames: ["collection", "operation"],
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    }),
    makeCounterProvider({
        name: MetricNames.CACHE_HIT_TOTAL,
        help: "Total number of cache hits",
    }),
    makeCounterProvider({
        name: MetricNames.CACHE_MISS_TOTAL,
        help: "Total number of cache misses",
    }),

    // Error Metrics
    makeCounterProvider({
        name: MetricNames.ERRORS_TOTAL,
        help: "Total number of errors",
        labelNames: ["error_type", "service"],
    }),
    makeCounterProvider({
        name: MetricNames.ACTION_FAILURES_TOTAL,
        help: "Total number of action failures",
        labelNames: ["action_type", "reason"],
    }),

    // System Metrics
    makeCounterProvider({
        name: MetricNames.EVENT_EMITTED_TOTAL,
        help: "Total number of events emitted",
        labelNames: ["event_type"],
    }),
    makeCounterProvider({
        name: MetricNames.KAFKA_MESSAGES_PUBLISHED_TOTAL,
        help: "Total number of Kafka messages published",
    }),
    makeCounterProvider({
        name: MetricNames.KAFKA_MESSAGES_CONSUMED_TOTAL,
        help: "Total number of Kafka messages consumed",
    }),
]
