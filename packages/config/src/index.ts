import {z} from "zod";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const ConfigSchema = z.object({
    GOOGLE_GENAI_API_KEY: z.string().min(1, "GOOGLE_GENAI_API_KEY is required"),
    E2B_API_KEY: z.string().min(1, "E2B_API_KEY is required"),
    BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
    BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    DO_SPACES_REGION: z.string().min(1, "DO_SPACES_REGION is required"),
    DO_SPACES_ENDPOINT: z.string().min(1, "DO_SPACES_ENDPOINT is required"),
    DO_SPACES_KEY: z.string().min(1, "DO_SPACES_KEY is required"),
    DO_SPACES_BUCKET: z.string().min(1, "DO_SPACES_BUCKET is required"),
    DO_SPACES_SECRET: z.string().min(1, "DO_SPACES_SECRET is required"),
});

const env = ConfigSchema.parse(process.env);

export const config = {
    googleGenAiApiKey: env.GOOGLE_GENAI_API_KEY,
    e2bApiKey: env.E2B_API_KEY,
    betterAuthSecret: env.BETTER_AUTH_SECRET,
    betterAuthUrl: env.BETTER_AUTH_URL,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,  
    doSpacesRegion: env.DO_SPACES_REGION,
    doSpacesEndpoint: env.DO_SPACES_ENDPOINT,
    doSpacesBucket: env.DO_SPACES_BUCKET,
    doSpacesKey: env.DO_SPACES_KEY,
    doSpacesSecret: env.DO_SPACES_SECRET,  
};