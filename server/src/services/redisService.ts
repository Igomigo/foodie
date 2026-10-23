import { getRedisClient } from "../config/redis";

export async function setCache(key: string, value: unknown, ttl = 900) {
  await getRedisClient().setex(key, ttl, JSON.stringify(value));
}

export async function getCache(key: string): Promise<unknown> {
  const value = await getRedisClient().get(key);
  return value ? JSON.parse(value) : null;
}
