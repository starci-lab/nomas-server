import { InjectMongoose } from "../decorators"
import { GAME_MONGOOSE_CONNECTION_NAME } from "./constants"
import { getMongooseToken } from "../decorators"

export const InjectGameMongoose = () => InjectMongoose(GAME_MONGOOSE_CONNECTION_NAME)
export const getGameMongooseToken = () => getMongooseToken(GAME_MONGOOSE_CONNECTION_NAME)