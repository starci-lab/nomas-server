import { Injectable, Scope } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

@Injectable({ scope: Scope.REQUEST })
export class RequestLifecycleService {
    private readonly metadata: Record<string, unknown> = {}
    constructor(
        private readonly reflector: Reflector,
    ) {}

    setMetadata<T>(key: string, value: T) {
        this.metadata[key] = value
    }

    getMetadata<T>(key: string): T | undefined {
        return this.metadata[key] as T | undefined
    }
}