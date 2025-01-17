import { CosmosClient, Container, QueryIterator, Database, Resource } from "@azure/cosmos"

const instance = new CosmosClient(process.env.NODE_ENV === "development" ? process.env.CONFIGURATION__AZURECOSMOSDB__ENDPOINT__LOCAL : process.env.CONFIGURATION__AZURECOSMOSDB__ENDPOINT)

async function db(id: string) {
    const response = await instance.databases.createIfNotExists({ id })
    return response.database
}

export function createContainerInterface(container: Container) {
    return {
        async item<T>(id: string, ...key: string[]) {
            return container.item(id, key).read<T>()
        },

        async createDocument<T>(document: T) {
            return (await container.items.create(document)).resource
        },

        async sql<T>(query: string, ...partitionKey: string[]): Promise<QueryIterator<T>> {
            return container.items.query(query, { partitionKey })
        }
    }
}

export const cosmosContainer = async <R>(id: string, fn: (c: ReturnType<typeof createContainerInterface>) => R) => {
    const { container } = await db("datos").then(({ containers }) => containers.createIfNotExists({ id }))

    return fn(createContainerInterface(container))
}