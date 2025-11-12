import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { GRAPHQL_SIGNATURE_STRATEGY } from "../strategies"
import { GqlExecutionContext } from "@nestjs/graphql"

@Injectable()
export class GraphQLSignatureGuard extends AuthGuard(GRAPHQL_SIGNATURE_STRATEGY) {
    constructor() {
        super()
    }

    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context)
        return ctx.getContext().req
    }
}
