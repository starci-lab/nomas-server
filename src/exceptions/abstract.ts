export abstract class AbstractException extends Error {
    public readonly code: string
    // this is the name of the exception class, it will be used to identify the exception in the sentry
    public readonly name: string

    constructor(message: string, code: string, name: string) {
        super(message)
        this.code = code
        this.name = name
    }
}
