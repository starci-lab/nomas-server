import { Injectable } from "@nestjs/common"

@Injectable()
export class AppService {
    getHello(): void {
        throw new Error("Test error")
    }
}
