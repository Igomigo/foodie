import Redis from "ioredis";
import { logger } from "../utils/logger";

let client: Redis | undefined;

export function getRedisClient() {
  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      connectTimeout: 1000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    client.on("error", (error: Error) => logger.error(error.message, "Redis"));
  }
  return client;
}

export async function disconnectRedis() {
  if (!client) return;
  if (client.status === "ready") await client.quit();
  else client.disconnect();
  client = undefined;
}
