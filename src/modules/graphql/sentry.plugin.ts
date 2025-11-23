import * as Sentry from "@sentry/nestjs"

/**
 * Apollo Server plugin to capture GraphQL errors to Sentry
 */
export const SentryApolloPlugin = {
    async requestDidStart() {
        return {
            async didEncounterErrors(requestContext) {
                // Capture all errors to Sentry
                if (requestContext.errors) {
                    for (const error of requestContext.errors) {
                        // Capture the original error if available
                        const originalError = error.originalError || error

                        Sentry.captureException(originalError, {
                            tags: {
                                graphql: true,
                                operation: requestContext.request.operationName || "unknown",
                            },
                            extra: {
                                query: requestContext.request.query,
                                variables: requestContext.request.variables,
                                path: error.path,
                            },
                        })
                    }
                }
            },
        }
    },
}
