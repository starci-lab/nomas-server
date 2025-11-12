import { Injectable } from "@nestjs/common"
import { INonceMessage, Platform } from "@typedefs"
import { DayjsService } from "@modules/mixin"

@Injectable()
export class NonceService {
    constructor(
        private readonly dayjsService: DayjsService,
    ) {}

    async generateNonceMessage(
        platform: Platform,
    ): Promise<INonceMessage> {
        return {
            nonce: this.dayjsService.now().unix(),
            platform: platform,
        }
    }
}