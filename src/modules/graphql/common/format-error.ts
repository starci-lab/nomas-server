import * as Sentry from "@sentry/nestjs"
import { GraphQLError } from "graphql"
import { getResolverSource } from "./utils"

/**
 * Format GraphQL errors and capture to Sentry
 * This function is used as formatError in Apollo Server configuration
 *
 * According to Apollo Server best practices:
 * - Preserve all extensions from the original error
 * - Do not override extensions.code if it already exists
 * - Support http extension for setting HTTP status codes and headers
 * - Return a properly formatted GraphQLError for the client
 *
 * @see https://www.apollographql.com/docs/apollo-server/data/errors
 */
export function formatGraphQLError(error: GraphQLError): GraphQLError {
    // Get the original error (the actual exception thrown in code)
    const originalError = error.originalError || error

    // Get error name with priority:
    // 1. Custom exception class name (if originalError is a custom exception)
    // 2. Code from extensions (if GraphQLError is thrown directly with code)
    // 3. Error name property
    // 4. Constructor name
    // 5. Default to "UnknownError"
    let errorName: string

    if (originalError !== error && originalError instanceof Error) {
        // Has originalError - use its name
        errorName = originalError.constructor?.name || originalError.name || "UnknownError"
    } else {
        // No originalError - check extensions.code first
        const extensionCode = error.extensions?.code as string | undefined
        if (extensionCode) {
            errorName = extensionCode
        } else {
            // Fallback to error name or constructor name
            errorName = error.name || error.constructor?.name || "GraphQLError"
        }
    }

    // Get resolver source for better error tracking
    const source = getResolverSource(error)

    // Get operation name safely
    const operationName =
        (typeof error.extensions?.operationName === "string" ? error.extensions.operationName : "Unknown") || "Unknown"

    // Create a new Error object with the correct name to ensure Sentry uses the exception name
    // instead of the function name from stack trace
    const errorForSentry = new Error(error.message)
    errorForSentry.name = errorName
    errorForSentry.stack = originalError instanceof Error ? originalError.stack : error.stack

    // Capture to Sentry with full context
    Sentry.captureException(errorForSentry, {
        tags: {
            graphql: "true",
            source,
            errorType: errorName,
            operation: operationName,
        },
        extra: {
            graphql: {
                message: error.message,
                path: error.path,
                locations: error.locations,
                extensions: error.extensions,
            },
            originalError: {
                name: errorName,
                message: originalError instanceof Error ? originalError.message : String(originalError),
                stack: originalError instanceof Error ? originalError.stack : undefined,
                constructor: originalError.constructor?.name,
            },
        },
        level: "error" as const,
    })

    // Return formatted error for Apollo Server
    // According to Apollo Server docs, we should preserve all extensions from the original error
    // Do not override extensions.code if it already exists
    // Support http extension for setting HTTP status codes and headers
    const extensions = { ...error.extensions }

    // Only set default code if no code exists in extensions
    // This preserves custom error codes from the original error
    if (!extensions.code) {
        extensions.code = "INTERNAL_SERVER_ERROR"
    }

    // Preserve http extension if it exists (for setting HTTP status codes and headers)
    // Apollo Server will use this to set the HTTP response status and headers
    // See: https://www.apollographql.com/docs/apollo-server/data/errors#setting-http-status-code-and-headers
    if (error.extensions?.http) {
        extensions.http = error.extensions.http
    }

    // Return a new GraphQLError with all original properties preserved
    // This ensures Apollo Server can properly format the error response
    return new GraphQLError(error.message, {
        nodes: error.nodes,
        source: error.source,
        positions: error.positions,
        path: error.path,
        originalError: error.originalError,
        extensions,
    })
}
