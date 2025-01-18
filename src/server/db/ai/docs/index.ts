import { PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos"
import { once } from "ramda"
import ai from "~~/db/ai"
import { TextChunk } from "~~/db/def/textChunk"
import { LanguageISO } from "~~/db/types"

const documents = once(() => ai((db) => db.container("DocumentsTest5", {
    kind: PartitionKeyKind.MultiHash,
    paths: ["/documentId", "/languageIso"],
    version: PartitionKeyDefinitionVersion.V2
})))

export async function createChunk<I extends LanguageISO>(item: TextChunk<I>) {
    const docs = await documents()

    return docs.createDocument(item)
}

export async function getTextDocs(document: string, language: LanguageISO) {
    const docs = await documents()

    return docs.sql("SELECT d.content.text as text, d.languageIso as language FROM Documents d", document, language)
}