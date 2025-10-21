import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@bloom/db";
import { config } from "@bloom/config";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google:{
            clientId: config.googleClientId,
            clientSecret: config.googleClientSecret,
        }
    }
});