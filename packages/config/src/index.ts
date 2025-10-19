import {z} from "zod";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const ConfigSchema = z.object({
    GOOGLE_GENAI_API_KEY: z.string().min(1, "GOOGLE_GENAI_API_KEY is required"),
    E2B_API_KEY: z.string().min(1, "E2B_API_KEY is required"),
});

console.log(process.env.GOOGLE_GENAI_API_KEY);

const env = ConfigSchema.parse(process.env);

export const config = {
    googleGenAiApiKey: env.GOOGLE_GENAI_API_KEY,
    e2bApiKey: env.E2B_API_KEY,
};