import { Service } from "typedi";
import { User } from "../../user/domain/user.model";
import { UserRepository } from "../../repositories/userRepository/userRepo";
import { Logger } from "../../utils/logger";
import { serviceResponse } from "../../interfaces/serviceResponse";
import { RedisService } from "../../services/redisService";
import * as bcrypt from "bcrypt";

@Service()
export class SignupService {

    constructor(
        private readonly userRepo: UserRepository,
        private readonly logger: Logger,
        private readonly redis: RedisService
    ) {}

    public async signup(data: User): Promise<serviceResponse<User>> {
        try {
            // Check if user already exists
            const user = await this.userRepo.findByEmail(data.email);
            if (user) {
                return {
                    "statusCode": 409,
                    "message": "User already exists"
                }
            }

            // Hash password
            const hashedPassword = await this.hashPassword(data.password);

            // Create new user
            const newUser = await this.userRepo.create({
                ...data,
                password: hashedPassword
            });

            // Store the new user object in redis
            await this.redis.set(`user:${newUser._id}`, newUser);

            // Return success response
            this.logger.info(`User created successfully: ${newUser.username}`, this.signup.name);
            return {
                "statusCode": 201,
                "message": "User account created successfully",
                "data": newUser
            }

        } catch (error: any) {
            this.logger.error(error.message, this.signup.name);
            return {
                "statusCode": 500,
                "message": "Failed to create user account",
                "error": error.message
            }
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }
}
