import { AbstractException } from "../abstract"

export class PlatformNotFoundException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "PLATFORM_NOT_FOUND_EXCEPTION")
    }
}