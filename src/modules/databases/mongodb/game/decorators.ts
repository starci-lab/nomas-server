import { InjectMongoose } from "../decorators"
import { GAME_MONGOOSE_CONNECTION_NAME } from "./constants"

export const InjectGameMongoose = () => InjectMongoose(GAME_MONGOOSE_CONNECTION_NAME)