import { AbstractException } from "../abstract"

export class QueryGameUserNotFoundException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "QUERY_GAME_USER_NOT_FOUND_EXCEPTION")
    }
}
