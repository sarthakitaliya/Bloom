import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    credentials: "include",
})

export const { signIn, signUp, useSession } = createAuthClient()