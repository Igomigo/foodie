import { Service } from "typedi";
import { RedisConfig } from "../config/redis";
import Redis from "ioredis";

@Service()
export class RedisService {
    private readonly redis: Redis;

    constructor(
        private readonly redisConfig: RedisConfig
    ) {
        this.redis = this.redisConfig.getClient();
    }

    // Set key-value pair with optional expiration time
    public async set(key: string, value: any, ttl?: number) {
        const stringValue = JSON.stringify(value);
        if (ttl) {
            await this.redis.setex(key, ttl, stringValue);
        } else {
            await this.redis.set(key, stringValue);
        }
    }

    // Get value by key
    public async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key)
        return value ?JSON.parse(value) : null;
    }

    // Delete key
    public async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    // Check if key exists
    public async exists(key: string): Promise<boolean> {
        const result = await this.redis.exists(key);
        return result === 1;
    }

    // Set expiration time for existing key
    public async expire(key: string, seconds: number): Promise<void> {
        await this.redis.expire(key, seconds);
    }

    // Get ttl (time to live) of a key
    public async ttl(key: string): Promise<number> {
        return await this.redis.ttl(key);
    }

    // Clear all keys (use with caution)
    public async flushAll(): Promise<void> {
        await this.redis.flushall();
    }
}
