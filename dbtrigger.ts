import { app, InvocationContext } from "@azure/functions";

export async function dbtrigger(documents: unknown[], context: InvocationContext): Promise<void> {
    context.log(`Cosmos DB function processed ${documents.length} documents`);
}

app.cosmosDB('dbtrigger', {
    connectionStringSetting: 'sqldirectconnecttest_DOCUMENTDB',
    databaseName: 'sql-directconnect-test',
    collectionName: 'Documentos',
    createLeaseCollectionIfNotExists: false,
    handler: dbtrigger
});
