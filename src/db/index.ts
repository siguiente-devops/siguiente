import { CosmosClient, Container, PartitionKeyDefinition } from "@azure/cosmos"

function cosmosdb() {
    const instance = new CosmosClient(process.env.NODE_ENV === "development" ? process.env.CONFIGURATION__AZURECOSMOSDB__ENDPOINT__LOCAL : process.env.CONFIGURATION__AZURECOSMOSDB__ENDPOINT)
    return {
        async db(id: string) {
            const { database } = await instance.databases.createIfNotExists({ id })

            return {
                async container(id: string, def: PartitionKeyDefinition) {
                    const { container } = await database.containers.createIfNotExists({ id, partitionKey: def })

                    return {
                        async item<T>(id: string, ...key: string[]) {
                            return (await container.item(id, key).read<T>()).resource
                        },
                
                        async createDocument<T>(document: T) {
                            return (await container.items.upsert(document)).resource as T
                        },

                        async sql<T>(query: string, ...partitionKey: string[]) {
                            return container.items.query(query, { partitionKey }).fetchAll()
                        }
                    }
                }
            }
        }
    }    
}

export default cosmosdb()
