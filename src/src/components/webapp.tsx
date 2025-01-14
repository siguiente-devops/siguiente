'use client'

import React from "react"
import { Test } from "./actions"

export function WebApp() {
    const [state, action, pending] = React.useActionState(Test, {input: "nada"})

    return (
        <form action={action}>
            {pending?"loading":JSON.stringify(state)}
            <input type="text" name="input" />
            <button type="submit">submit</button>
        </form>
    )
}