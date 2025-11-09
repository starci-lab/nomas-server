import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { GRAPHQL_SIGNATURE_STRATEGY } from "../strategies"

@Injectable()
export class GraphQLSignatureGuard extends AuthGuard(GRAPHQL_SIGNATURE_STRATEGY) {
    constructor() {
        super()
    }
}
