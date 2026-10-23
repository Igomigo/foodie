import { getCache, setCache } from "../services/redisService";

export async function setDemoUser(user: { id: string }) {
  await setCache(`demo:user:${user.id}`, user);
}

export function getDemoUser(key: string) {
  return getCache(`demo:user:${key.replace(/^user:/, "")}`);
}
