export abstract class AbstractException extends Error {
    private readonly code: string
    constructor(
        message: string,
        code: string
    ) {
        super(message)
        this.code = code
    }
}