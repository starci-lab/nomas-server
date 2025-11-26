import { AbstractGraphQLException } from "src/exceptions/graphql/base"

export class MutationAuthInvalidSignatureException extends AbstractGraphQLException {
    constructor(message: string) {
        super(message, "MUTATION_AUTH_INVALID_SIGNATURE_EXCEPTION", "MutationAuthInvalidSignatureException")
    }
}
