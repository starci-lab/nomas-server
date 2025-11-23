import { GraphQLError } from "graphql"

export abstract class AbstractGraphQLException extends GraphQLError {
    public readonly code: string
    public readonly name: string

    constructor(message: string, code: string, name: string) {
        super(message)
        this.code = code
        this.name = name
    }
}
