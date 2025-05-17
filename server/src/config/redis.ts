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
            this.logger.log("connected to redis", this);
        });

        this.redis.on('error', () => {
            this.logger.error("failed to connect to redis", this);
            process.exit(1);
        });
    }

    public getClient(): Redis {
        return this.redis;
    }

    public async disconnect() {
        try {
            await this.redis.quit();
            this.logger.log("disconnected from redis", this);
        } catch (error) {
            this.logger.error("failed to disconnect from redis", this);
            process.exit(1);
        }
    }
}
