import { Controller, Get, Param } from "@nestjs/common"
import {
    SignatureException,
    PublicKeyRequiredException,
    AccountAddressRequiredException,
    SignatureRequiredException,
    MessageRequiredException,
    PlatformRequiredException,
    SignatureInvalidException,
    MessageInvalidException,
    PlatformNotFoundException,
    SeederException,
    QueryGameUserNotFoundException,
} from "../../../src/exceptions"

@Controller("test")
export class TestController {
    @Get("error/:type")
    throwError(@Param("type") type: string): void {
        switch (type) {
            case "signature":
                throw new SignatureException("Test signature exception")
            case "public-key-required":
                throw new PublicKeyRequiredException("Public key is required")
            case "account-address-required":
                throw new AccountAddressRequiredException("Account address is required")
            case "signature-required":
                throw new SignatureRequiredException("Signature is required")
            case "message-required":
                throw new MessageRequiredException("Message is required")
            case "platform-required":
                throw new PlatformRequiredException("Platform is required")
            case "signature-invalid":
                throw new SignatureInvalidException("Signature is invalid")
            case "message-invalid":
                throw new MessageInvalidException("Message is invalid")
            case "platform-not-found":
                throw new PlatformNotFoundException("Platform not found")
            case "seeder":
                throw new SeederException("Seeder error occurred")
            case "query-game-user-not-found":
                throw new QueryGameUserNotFoundException("Game user not found")
            case "generic":
                throw new Error("Generic error occurred")
            default:
                throw new Error("Unknown error type")
        }
    }

    @Get("errors")
    getAvailableErrors(): Record<string, string> {
        return {
            signature: "SignatureException (401)",
            "public-key-required": "PublicKeyRequiredException (401)",
            "account-address-required": "AccountAddressRequiredException (401)",
            "signature-required": "SignatureRequiredException (401)",
            "message-required": "MessageRequiredException (401)",
            "platform-required": "PlatformRequiredException (401)",
            "signature-invalid": "SignatureInvalidException (401)",
            "message-invalid": "MessageInvalidException (401)",
            "platform-not-found": "PlatformNotFoundException (404)",
            seeder: "SeederException (500)",
            "query-game-user-not-found": "QueryGameUserNotFoundException (404)",
            generic: "Generic Error (500)",
        }
    }
}
