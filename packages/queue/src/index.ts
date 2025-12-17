import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "@bloom/config";

export const connection = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
});

export const builderQueue = new Queue("builder-queue", { connection });