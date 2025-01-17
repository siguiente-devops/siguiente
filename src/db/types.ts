
export const enum DocumentFormat {
    JSON = "json",
    TEXT = "text"
}

export type ContentType<T extends DocumentFormat, K> = K & {
    type: T
}

export enum LanguageISO {
    English = "en",
    Español = "es"
}

export interface Doc<T, I extends LanguageISO, F extends DocumentFormat = DocumentFormat.JSON> {
    documentId: string
    languageIso: I
    content: ContentType<F, T>
}