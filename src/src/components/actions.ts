'use server'

export async function Test(prev: {input: string}, data: FormData) {
    return {
        input: data.get("input")?.toString() ?? "empty-input"
    }
}