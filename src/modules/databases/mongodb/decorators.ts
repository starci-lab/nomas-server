import { InjectConnection } from "@nestjs/mongoose"
export const InjectMongoose = (connectionName: string) => InjectConnection(connectionName)