import { cosmosContainer } from ".."
import { Doc, DocumentFormat, LanguageISO } from "../types"

export interface TextDocumentBody {
    text: string
}

export type TextChunk<I extends LanguageISO> = Doc<TextDocumentBody, I, DocumentFormat.TEXT>

export function chunk<I extends LanguageISO>(documentId: string, languageIso: I, text: string): TextChunk<I> {
    return {
        documentId,
        languageIso,
        content: {
            type: DocumentFormat.TEXT,
            text
        }
    }
}

export function createText(chunk: TextChunk<any>) {
    return cosmosContainer("Documents", (db) => db.createDocument(chunk))
}
