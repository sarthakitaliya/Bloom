import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    credentials: "include",
    fetchOptions: {
        credentials: "include"
    }
})

export const { signIn, signUp, useSession } = authClient