import { Catch, ExceptionFilter, ArgumentsHost, ExecutionContext, Logger } from "@nestjs/common"
import { Observable } from "rxjs"
import { AbstractGraphQLException } from "src/exceptions/graphql/base"
import { GraphQLError } from "graphql"
import { SentryExceptionCaptured } from "@sentry/nestjs"
import * as Sentry from "@sentry/nestjs"
import { GqlExecutionContext } from "@nestjs/graphql"

/**
 * This filter is used to catch all graphql exceptions and return a formatted error response.
 * Also captures exceptions to Sentry with full GraphQL context.
 */
@Catch(AbstractGraphQLException)
export class GraphQLExceptionFilter implements ExceptionFilter<AbstractGraphQLException> {
    private readonly logger = new Logger(GraphQLExceptionFilter.name)
    @SentryExceptionCaptured()
    catch(exception: AbstractGraphQLException, host: ArgumentsHost): Observable<unknown> {
        // Try to get GraphQL context if available
        let source = "UnknownResolver"
        let operationName = "Unknown"
        let fieldName: string | undefined
        let path: readonly (string | number)[] | undefined

        try {
            // Check if this is a GraphQL context
            const contextType = host.getType() as string
            if (contextType === "graphql") {
                const gqlContext = GqlExecutionContext.create(host as ExecutionContext)
                const info = gqlContext.getInfo()
                const context = gqlContext.getContext()

                if (info) {
                    fieldName = info.fieldName
                    path = info.path
                    source = fieldName ? `Resolver:${fieldName}` : "UnknownResolver"
                }

                // Get operation name from context if available
                if (context?.req?.body?.operationName) {
                    operationName = context.req.body.operationName
                }
            }
        } catch {
            // If we can't get GraphQL context, use defaults
            // This is fine, we'll still capture the exception
        }

        // Create error for Sentry with correct name
        const errorForSentry = new Error(exception.message)
        errorForSentry.name = exception.name || exception.constructor?.name || "AbstractGraphQLException"
        errorForSentry.stack = exception.stack

        // Capture to Sentry with full context
        Sentry.captureException(errorForSentry, {
            tags: {
                graphql: "true",
                source: "graphql-exception-filter",
                errorType: exception.name || exception.constructor?.name || "Unknown",
                operation: operationName,
                resolver: source,
            },
            extra: {
                graphql: {
                    message: exception.message,
                    code: exception.code,
                    name: exception.name,
                    path: path,
                    fieldName: fieldName,
                },
                exception: {
                    name: exception.name,
                    code: exception.code,
                    message: exception.message,
                    stack: exception.stack,
                },
            },
            level: "error" as const,
        })

        // Throw GraphQLError for Apollo Server to handle
        throw new GraphQLError(exception.message, {
            extensions: {
                code: exception.code,
                name: exception.name,
            },
        })
    }
}
