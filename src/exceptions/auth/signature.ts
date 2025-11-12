import { AbstractException } from "../abstract"

export class SignatureException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "SIGNATURE_EXCEPTION")
    }
}

export class PublicKeyRequiredException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "PUBLIC_KEY_REQUIRED_EXCEPTION")
    }
}

export class AccountAddressRequiredException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "ACCOUNT_ADDRESS_REQUIRED_EXCEPTION")
    }
}       

export class SignatureRequiredException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "SIGNATURE_REQUIRED_EXCEPTION")
    }
}

export class MessageRequiredException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "MESSAGE_REQUIRED_EXCEPTION")
    }
}

export class PlatformRequiredException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "PLATFORM_REQUIRED_EXCEPTION")
    }
}

export class SignatureInvalidException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "SIGNATURE_INVALID_EXCEPTION")
    }
}

export class MessageInvalidException extends AbstractException {
    constructor(
        message: string,
    ) {
        super(message, "MESSAGE_INVALID_EXCEPTION")
    }
}