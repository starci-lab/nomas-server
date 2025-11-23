import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common"
import { SentryExceptionCaptured } from "@sentry/nestjs"
import { Response } from "express"
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
} from "../../../exceptions"

interface ErrorResponse {
    statusCode: number
    message: string
    code: string
}

@Catch()
export class SentryCatchAllExceptionFilter implements ExceptionFilter {
    // sentry will capture the exception
    @SentryExceptionCaptured()
    catch(exception: unknown, host: ArgumentsHost): void {
        console.log("🔥 Exception caught in filter:", exception)

        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        let errorResponse: ErrorResponse

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
            errorResponse = this.handleAuthException(exception)
        }
        // Handle blockchain exceptions
        else if (exception instanceof PlatformNotFoundException) {
            errorResponse = this.handleBlockchainException(exception)
        }

        // Handle database exceptions
        else if (exception instanceof SeederException) {
            errorResponse = this.handleDatabaseException(exception)
        }

        // Handle graphql exceptions
        else if (exception instanceof QueryGameUserNotFoundException) {
            errorResponse = this.handleGraphqlException(exception)
        }

        // Handle generic errors
        else if (exception instanceof Error) {
            errorResponse = this.handleGenericError(exception)
        } else {
            errorResponse = {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
            }
        }

        console.log("📤 Sending error response:", errorResponse)

        response.status(errorResponse.statusCode).json({
            statusCode: errorResponse.statusCode,
            message: errorResponse.message,
            code: errorResponse.code,
            timestamp: new Date().toISOString(),
        })
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
