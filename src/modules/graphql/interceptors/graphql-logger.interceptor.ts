import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql"
import { InjectWinston } from "@winston"
import { Observable, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { Logger } from "winston"
import * as Sentry from "@sentry/node"
import { inspect } from "util"
import { Request } from "express"

@Injectable()
export class GraphQLLoggerInterceptor implements NestInterceptor {
    constructor(@InjectWinston() private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (context.getType<GqlContextType>() !== "graphql") {
            return next.handle()
        }

        const gqlContext = GqlExecutionContext.create(context)
        const info = gqlContext.getInfo()
        const parentType = info?.parentType?.name
        const fieldName = info?.fieldName
        const path = `${parentType}.${fieldName}`
        const args = this.sanitizeArgs(gqlContext.getArgs())
        const startedAt = Date.now()

        // we need to get the trace id from the span of sentry
        const span = Sentry.getActiveSpan()
        const traceId = span?.spanContext().traceId

        const ctxValue = gqlContext.getContext<{ user?: unknown; requestId?: string; req?: Request }>()
        // TODO: add user in context for tracing
        // const userId = ctxValue?.user?.id
        const requestId = ctxValue?.requestId
        const req = ctxValue?.req
        const networkMeta = req ? this.extractRequestMeta(req) : undefined

        return next.handle().pipe(
            tap(() => {
                this.logger.info("GraphQL Resolver Log", {
                    path,
                    traceId,
                    requestId,
                    // userId,
                    durationMs: Date.now() - startedAt,
                    variables: args,
                    success: true,
                    ...(networkMeta ? { network: networkMeta } : {}),
                })
            }),
            catchError((error: Error) => {
                this.logger.error("GraphQL Resolver Error Log", {
                    path,
                    traceId,
                    requestId,
                    // userId,
                    durationMs: Date.now() - startedAt,
                    variables: args,
                    success: false,
                    ...(networkMeta ? { network: networkMeta } : {}),
                    error: {
                        name: error.name,
                        message: error.message,
                        stack: error.stack,
                    },
                })
                return throwError(() => error)
            }),
        )
    }

    private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
        if (!args) return {}
        return Object.entries(args).reduce<Record<string, unknown>>((acc, [key, value]) => {
            if (/(password|token|secret)/i.test(key)) {
                acc[key] = "***redacted***"
            } else {
                acc[key] = value
            }
            return acc
        }, {})
    }

    private extractRequestMeta(req: Request) {
        const headers = req.headers || {}
        const forwardedFor = headers["x-forwarded-for"] as string | undefined
        const clientIp =
            forwardedFor?.split(",")?.[0]?.trim() ??
            (headers["x-real-ip"] as string | undefined) ??
            req.ip ??
            req.ips?.[0] ??
            req.socket?.remoteAddress

        return {
            clientIp,
            clientId: headers["x-client-id"] ?? headers["client-id"],
            userAgent: headers["user-agent"],
            referer: headers["referer"] ?? headers["referrer"],
            protocol: req.protocol,
            host: headers["host"] ?? req.host ?? req.hostname,
            remoteAddress: req.socket?.remoteAddress,
            headers: this.pickReadableHeaders(headers),
        }
    }

    private pickReadableHeaders(headers: Request["headers"]) {
        if (!headers) {
            return {}
        }
        const allowed = [
            "host",
            "user-agent",
            "referer",
            "content-type",
            "content-length",
            "accept",
            "accept-language",
            "accept-encoding",
            "x-forwarded-for",
            "x-real-ip",
            "x-client-id",
            "authorization",
        ]

        return allowed.reduce<Record<string, string>>((acc, key) => {
            if (!(key in headers)) {
                return acc
            }
            if (key === "authorization" && headers[key]) {
                acc[key] = "***redacted***"
                return acc
            }
            const value = headers[key]
            acc[key] =
                typeof value === "string" || typeof value === "number" ? String(value) : inspect(value, { depth: 1 })
            return acc
        }, {})
    }
}
