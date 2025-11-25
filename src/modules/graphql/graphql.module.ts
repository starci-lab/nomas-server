import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./graphql.module-definition"
import { GraphQLModule as NestGraphQLModule } from "@nestjs/graphql"
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { GraphQLJSON } from "graphql-type-json"
import { GameQueriesModule } from "./queries"
import { GameMutationsModule } from "./mutations"
import { GraphQLExceptionFilter } from "@modules/graphql/exception-filter/graphql-exception.filter"
import { GraphQLLoggerInterceptor } from "./interceptors"
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core"
// import { formatGraphQLError } from "./common"

@Module({})
export class GraphQLModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE) {
        // register the module
        const dynamicModule = super.register(options)
        const {
            useFederation = false,
            resolvers = {
                game: true,
            },
            plugins = {
                json: true,
            },
        } = options

        const imports: Array<DynamicModule> = []
        // register apollo graphql module
        if (useFederation) {
            throw new Error("Federation is not supported yet")
        } else {
            imports.push(
                NestGraphQLModule.forRoot<ApolloDriverConfig>({
                    driver: ApolloDriver,
                    playground: false,
                    autoSchemaFile: true,
                    plugins: [ApolloServerPluginLandingPageLocalDefault()],
                    resolvers: plugins.json ? { JSON: GraphQLJSON } : undefined,
                    context: ({ req, res }) => ({ req, res }),
                    // Format and capture GraphQL errors to Sentry
                    formatError: (err) => {
                        return err
                    },
                }),
            )
        }
        // register all resolvers
        if (resolvers.game) {
            imports.push(GameQueriesModule.register({}))
            imports.push(GameMutationsModule.register({}))
        }
        return {
            ...dynamicModule,
            imports,
            providers: [
                ...(dynamicModule.providers || []),
                {
                    provide: APP_FILTER,
                    useClass: GraphQLExceptionFilter,
                },
                {
                    provide: APP_INTERCEPTOR,
                    useClass: GraphQLLoggerInterceptor,
                },
            ],
        }
    }
}
