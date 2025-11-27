/**
 * Centralized metric names following Prometheus naming convention:
 * {namespace}_{subsystem}_{metric_name}_{unit}
 */

export const MetricNames = {
    // Room Metrics
    ROOM_ACTIVE_TOTAL: "game_room_active_total",
    ROOM_CREATED_TOTAL: "game_room_created_total",
    ROOM_DISPOSED_TOTAL: "game_room_disposed_total",
    ROOM_PLAYERS_CURRENT: "game_room_players_current",
    ROOM_MAX_CAPACITY_USAGE: "game_room_max_capacity_usage",

    // Player Metrics
    PLAYER_JOINED_TOTAL: "game_player_joined_total",
    PLAYER_LEFT_TOTAL: "game_player_left_total",
    PLAYER_RECONNECTED_TOTAL: "game_player_reconnected_total",
    PLAYER_ACTIVE_CURRENT: "game_player_active_current",

    // Pet Actions Metrics
    PET_BOUGHT_TOTAL: "game_pet_bought_total",
    PET_REMOVED_TOTAL: "game_pet_removed_total",
    PET_FED_TOTAL: "game_pet_fed_total",
    PET_PLAYED_TOTAL: "game_pet_played_total",
    PET_CLEANED_TOTAL: "game_pet_cleaned_total",
    PET_POOP_CREATED_TOTAL: "game_pet_poop_created_total",

    // Inventory & Store Metrics
    ITEM_PURCHASED_TOTAL: "game_item_purchased_total",
    FOOD_PURCHASED_TOTAL: "game_food_purchased_total",
    TOKENS_SPENT_TOTAL: "game_tokens_spent_total",

    // GraphQL Metrics
    GRAPHQL_REQUESTS_TOTAL: "graphql_requests_total",
    GRAPHQL_REQUESTS_DURATION_SECONDS: "graphql_requests_duration_seconds",
    GRAPHQL_ERRORS_TOTAL: "graphql_errors_total",

    // Performance Metrics
    ACTION_DURATION_SECONDS: "game_action_duration_seconds",
    DATABASE_QUERY_DURATION_SECONDS: "database_query_duration_seconds",
    CACHE_HIT_TOTAL: "cache_hit_total",
    CACHE_MISS_TOTAL: "cache_miss_total",

    // Error Metrics
    ERRORS_TOTAL: "game_errors_total",
    ACTION_FAILURES_TOTAL: "game_action_failures_total",

    // System Metrics
    EVENT_EMITTED_TOTAL: "game_event_emitted_total",
    KAFKA_MESSAGES_PUBLISHED_TOTAL: "game_kafka_messages_published_total",
    KAFKA_MESSAGES_CONSUMED_TOTAL: "game_kafka_messages_consumed_total",
} as const
