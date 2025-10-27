import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "@bloom/config";

export const connection = new IORedis(config.redisUrl || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
});

export const builderQueue = new Queue("builder-queue", { connection });