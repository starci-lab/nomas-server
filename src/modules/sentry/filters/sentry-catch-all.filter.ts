import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common"
import { SentryExceptionCaptured } from "@sentry/nestjs"
import * as Sentry from "@sentry/nestjs"
import { Response } from "express"
import { GqlExceptionFilter } from "@nestjs/graphql"
import {
    AccountAddressRequiredException,
    MessageInvalidException,
    MessageRequiredException,
    PlatformNotFoundException,
    PlatformRequiredException,
    PublicKeyRequiredException,
    QueryGameUserNotFoundException,
    SeederException,
    SignatureException,
    SignatureInvalidException,
    SignatureRequiredException,
} from "src/exceptions"
import { GraphQLError } from "graphql"

interface ErrorResponse {
    statusCode: number
    message: string
    code: string
}

@Catch()
export class SentryCatchAllExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
    // sentry will capture the exception
    @SentryExceptionCaptured()
    catch(exception: unknown, host: ArgumentsHost): void {
        const contextType = host.getType() as string

        // Handle GraphQL context
        if (contextType === "graphql") {
            this.handleGraphQLContext(exception)
            return
        }

        // Handle WebSocket context (Colyseus)
        if (contextType === "ws") {
            this.handleWebSocketContext(exception, host)
            return
        }

        // Handle HTTP context (default)
        this.handleHttpContext(exception, host)
    }

    private handleHttpContext(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        const errorResponse = this.buildErrorResponse(exception)

        response.status(errorResponse.statusCode).json({
            statusCode: errorResponse.statusCode,
            message: errorResponse.message,
            code: errorResponse.code,
            timestamp: new Date().toISOString(),
        })
    }

    private handleWebSocketContext(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToWs()
        const client = ctx.getClient()

        const errorResponse = this.buildErrorResponse(exception)

        // Send error back to WebSocket client if possible
        if (client && typeof client.send === "function") {
            try {
                client.send(
                    JSON.stringify({
                        error: {
                            statusCode: errorResponse.statusCode,
                            message: errorResponse.message,
                            code: errorResponse.code,
                            timestamp: new Date().toISOString(),
                        },
                    }),
                )
            } catch (sendError) {
                // If sending fails, log it but don't throw
                console.error("Failed to send error to WebSocket client:", sendError)
            }
        }
    }

    private handleGraphQLContext(exception: unknown): void {
        // Capture exception to Sentry before transforming to GraphQLError
        if (exception instanceof Error) {
            Sentry.captureException(exception)
        } else {
            Sentry.captureException(new Error(String(exception)))
        }

        const errorResponse = this.buildErrorResponse(exception)

        // For GraphQL, we need to throw a GraphQLError
        // Apollo will handle the formatting
        throw new GraphQLError(errorResponse.message, {
            extensions: {
                code: errorResponse.code,
                statusCode: errorResponse.statusCode,
                timestamp: new Date().toISOString(),
            },
        })
    }

    // === Error Response ===
    private buildErrorResponse(exception: unknown): ErrorResponse {
        // Handle auth exceptions
        if (
            exception instanceof SignatureException ||
            exception instanceof PublicKeyRequiredException ||
            exception instanceof AccountAddressRequiredException ||
            exception instanceof SignatureRequiredException ||
            exception instanceof MessageRequiredException ||
            exception instanceof PlatformRequiredException ||
            exception instanceof SignatureInvalidException ||
            exception instanceof MessageInvalidException
        ) {
            return this.handleAuthException(exception)
        }
        // Handle blockchain exceptions
        else if (exception instanceof PlatformNotFoundException) {
            return this.handleBlockchainException(exception)
        }

        // Handle database exceptions
        else if (exception instanceof SeederException) {
            return this.handleDatabaseException(exception)
        }

        // Handle graphql exceptions
        else if (exception instanceof QueryGameUserNotFoundException) {
            return this.handleGraphqlException(exception)
        }

        // Handle generic errors
        else if (exception instanceof Error) {
            return this.handleGenericError(exception)
        } else {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
            }
        }
    }

    private handleAuthException(
        exception:
            | SignatureException
            | PublicKeyRequiredException
            | AccountAddressRequiredException
            | SignatureRequiredException
            | MessageRequiredException
            | PlatformRequiredException
            | SignatureInvalidException
            | MessageInvalidException,
    ): ErrorResponse {
        return {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: exception.message,
            code: exception.code,
        }
    }

    private handleBlockchainException(exception: PlatformNotFoundException): ErrorResponse {
        return {
            statusCode: HttpStatus.NOT_FOUND,
            message: exception.message,
            code: exception.code,
        }
    }

    private handleDatabaseException(exception: SeederException): ErrorResponse {
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: exception.message,
            code: exception.code,
        }
    }

    private handleGraphqlException(exception: QueryGameUserNotFoundException): ErrorResponse {
        return {
            statusCode: HttpStatus.NOT_FOUND,
            message: exception.message,
            code: exception.code,
        }
    }

    private handleGenericError(exception: Error): ErrorResponse {
        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: exception.message,
            code: "INTERNAL_SERVER_ERROR",
        }
    }
}
