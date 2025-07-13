import { Service } from "typedi";
import { Account } from "../../domain/account.model";
import { AccountRepository } from "../../repositories/accountRepository/accountRepo";
import { Logger } from "../../utils/logger";
import { RedisService } from "../../services/redisService";
import { Bcrypt } from "../../utils/hashPassword";

@Service()
export class SignupService {

    constructor(
        private readonly accountRepo: AccountRepository,
        private readonly logger: Logger,
        private readonly redis: RedisService,
        private readonly bcrypt: Bcrypt
    ) {}

    public async signup(data: Account) {
        try {
            // Check if user already exists
            const user = await this.accountRepo.findByEmailOrUsername(data.email, data.username || "");
            if (user) {
                return {
                    "statusCode": 409,
                    "message": "User already exists"
                }
            }

            // Hash password
            const hashedPassword = await this.bcrypt.hash(data.password);

            // Create new user
            const newUser = await this.accountRepo.create({
                ...data,
                password: hashedPassword,
            });

            // Store the new user object in redis
            await this.redis.set(`user:${newUser._id}`, newUser);

            // Return success response
            this.logger.info(`User created successfully: ${newUser.username}`, "SignupService");
            return {
                "statusCode": 201,
                "message": "User account created successfully",
                "data": newUser
            }

        } catch (error: any) {
            this.logger.error(error.message, "SignupService");
            return {
                "statusCode": 500,
                "message": "Failed to create user account",
                "error": error.message
            }
        }
    }
}
