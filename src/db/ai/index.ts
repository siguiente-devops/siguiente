import cosmos from "~~/db"

type NP<T> = T extends Promise<infer I> ? I : never

export default async <R>(fn: (db: NP<ReturnType<typeof cosmos["db"]>>) => R) => fn(await cosmos.db("ai"))
