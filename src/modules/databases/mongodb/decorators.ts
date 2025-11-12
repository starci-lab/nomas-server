import { getConnectionToken, InjectConnection } from "@nestjs/mongoose"
export const InjectMongoose = (connectionName: string) => InjectConnection(connectionName)
export const getMongooseToken = (connectionName: string) => getConnectionToken(connectionName)