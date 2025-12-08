import { GraphQLError } from "graphql"

/**
 * Lấy tên resolver/module từ GraphQL error path hoặc originalError metadata
 */
export function getResolverSource(error: GraphQLError): string {
    // Nếu originalError có thêm metadata module
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalError: any = error.originalError || {}
    if (originalError?.__moduleName) {
        return originalError.__moduleName
    }

    // Nếu không, dùng path[0] (thường là query/mutation field name)
    if (error.path?.length) {
        return `Resolver:${error.path[0]}`
    }

    return "UnknownResolver"
}
