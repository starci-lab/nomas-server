import { AbstractException } from "../abstract"

export class SeederException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "SEEDER_EXCEPTION")
    }
}