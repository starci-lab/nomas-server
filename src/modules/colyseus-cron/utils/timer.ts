/**
 * Get the difference in seconds between the current time and the past time
 *
 * @param pastTime - The past time to compare against
 * @returns The difference in seconds
 */
export const getTimeDifferenceInSeconds = (pastTime: Date): number => {
    const currentTime = new Date()
    const differenceInMs = currentTime.getTime() - pastTime.getTime()
    return Math.floor(differenceInMs / 1000)
}

/**
 * Calculate stat update based on time difference and decay rate
 *
 * @param lastUpdate - Last update time
 * @param currentStat - Current stat value
 * @param decayPerHour - Decay rate per hour (default: 1)
 * @returns Object containing new stat value, new last update time, hours processed, and remaining seconds
 */
export const calculateStatUpdate = (
    lastUpdate: Date,
    currentStat: number,
    decayPerHour: number = 1,
): {
    newStat: number
    newLastUpdate: Date
    hoursProcessed: number
    remainingSeconds: number
} => {
    const HOUR_IN_SECONDS = 3600

    // Get the difference in seconds between the current time and the past time
    const diffInSeconds = getTimeDifferenceInSeconds(lastUpdate)

    // Calculate the number of complete hours passed
    const hoursPassedComplete = Math.floor(diffInSeconds / HOUR_IN_SECONDS)

    // If there is at least 1 hour passed, calculate the new stat value
    if (hoursPassedComplete > 0) {
        // Calculate the remaining seconds after subtracting complete hours
        const remainingSeconds = diffInSeconds % HOUR_IN_SECONDS

        // Calculate the new stat value
        const newStat = Math.max(0, currentStat - hoursPassedComplete * decayPerHour)

        // Calculate the new last_update time
        const now = new Date()
        const newLastUpdate = new Date(now.getTime() - remainingSeconds * 1000)

        return {
            newStat,
            newLastUpdate,
            hoursProcessed: hoursPassedComplete,
            remainingSeconds,
        }
    } else {
        // If there is no time passed, return the current stat and the same last_update time
        return {
            newStat: currentStat,
            newLastUpdate: lastUpdate,
            hoursProcessed: 0,
            remainingSeconds: diffInSeconds,
        }
    }
}

