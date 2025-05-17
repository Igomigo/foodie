import Redis from "ioredis";
import { Service } from "typedi";
import { Logger } from "../utils/logger";

@Service()
export class RedisConfig {
    private readonly redis: Redis;
    
    constructor(
        private readonly logger: Logger
    ) {
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.redis.on('connect', () => {
            this.logger.log("[Redis] connected to redis");
        });

        this.redis.on('error', () => {
            this.logger.error("[Redis] failed to connect to redis");
            process.exit(1);
        });
    }

    public getClient(): Redis {
        return this.redis;
    }

    public async disconnect() {
        try {
            await this.redis.quit();
            this.logger.log("[Redis] disconnected from redis");
        } catch (error) {
            this.logger.error("[Redis] failed to disconnect from redis");
            process.exit(1);
        }
    }
}
