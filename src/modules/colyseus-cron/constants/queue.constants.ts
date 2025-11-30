/**
 * Queue name constants for BullMQ queues
 */
export const QUEUE_NAME = {
    UPDATE_PET_STATS: "update-pet-stats",
    UPDATE_EVOLUTION: "update-evolution",
    CREATE_INCOME: "create-income",
} as const

/**
 * Job name constants for BullMQ jobs
 */
export const JOB_NAME = {
    UPDATE_PET_STATS: "update-pet-stats",
    UPDATE_EVOLUTION: "update-evolution",
    CREATE_INCOME: "create-income",
} as const

/**
 * Job ID constants for BullMQ repeatable jobs
 */
export const JOB_ID = {
    UPDATE_PET_STATS: "update-pet-stats",
    UPDATE_EVOLUTION: "update-evolution",
    CREATE_INCOME: "create-income",
} as const

/**
 * Prefix constants for queue namespacing
 */
export const PREFIX = {
    PET: "pet",
} as const

