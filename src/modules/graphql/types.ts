export interface GraphQLModuleOptions {
        // indicate whether to use federation
        useFederation?: boolean
        // resolvers to register
        resolvers: {
            game: boolean
        }
        // plugins to register
        plugins?: {
            json?: boolean
        }
    }