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
                        // https://learn.microsoft.com/en-us/rest/api/cosmos-db/access-control-on-cosmosdb-resources
                        // getAuthorizationTokenUsingMasterKey(verb: string, resourceType: string, resourceId: string, date: string, masterKey: string) {  
                        //     const key = new Buffer(masterKey, "base64");  
                          
                        //     const text = (verb || "").toLowerCase() + "\n" +   
                        //                (resourceType || "").toLowerCase() + "\n" +   
                        //                (resourceId || "") + "\n" +   
                        //                date.toLowerCase() + "\n" +   
                        //                "" + "\n";  
                          
                        //     const body = new Buffer(text, "utf8");
                        //     const signature = crypto.createHmac("sha256", key).update(body).digest("base64");  
                          
                        //     const MasterToken = "master";  
                          
                        //     const TokenVersion = "1.0";  
                          
                        //     return encodeURIComponent("type=" + MasterToken + "&ver=" + TokenVersion + "&sig=" + signature);  
                        // },

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
