import { AbstractGraphQLException } from "src/exceptions/graphql/base"
import { AbstractException } from "../abstract"

export class QueryGameUserNotFoundException extends AbstractException {
    constructor(message: string) {
        super(message, "QUERY_GAME_USER_NOT_FOUND_EXCEPTION", "QueryGameUserNotFoundException")
    }
}

export class QueryGameStaticNotFoundException extends AbstractGraphQLException {
    constructor(message: string) {
        super(message, "QUERY_GAME_STATIC_NOT_FOUND_EXCEPTION", "QueryGameStaticNotFoundException")
    }
}
