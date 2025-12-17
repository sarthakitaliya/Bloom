import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@bloom/db";
import { config } from "@bloom/config";

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
