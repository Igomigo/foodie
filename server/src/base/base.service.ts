import { Service } from "typedi";
import { RedisService } from "../services/redisService";
import { Logger } from "../utils/logger";

@Service()
export class BaseService {
    constructor(
        private readonly redis: RedisService,
        private readonly logger: Logger
    ) {}

    public async greet(): Promise<string> {
        return "Hello World, welcome to flavourCompass";
    }

    public async setUser(user: any) {
        const userKey = `user:${user.id}`;
        await this.redis.set(userKey, JSON.stringify(user));
        this.logger.log(`User ${user.id} set in Redis`, this);
        return user;
    }

    public async getUser(key: string) {
        const user: any = await this.redis.get(key);
        return JSON.parse(user);
    }
}
