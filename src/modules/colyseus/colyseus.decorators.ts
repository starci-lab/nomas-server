import { Inject } from "@nestjs/common"
import { COLYSEUS_SERVER } from "./constants"

export const InjectColyseusServer = () => Inject(COLYSEUS_SERVER) 