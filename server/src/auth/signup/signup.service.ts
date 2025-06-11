import { Service } from "typedi";
import { User } from "../../user/domain/user.model";
import { UserRepository } from "../../repositories/userRepository/userRepo";
import { Logger } from "../../utils/logger";
import { serviceResponse } from "../../interfaces/serviceResponse";
import { RedisService } from "../../services/redisService";

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

            // Prepare data for user creation
            const userData = {
                username: data.username,
                email: data.email,
                password: data.password,
                phoneNumber: data.phoneNumber,
                location: {
                    country: data.location.country,
                    state: data.location.state,
                    city: data.location.city
                }
            }

            // Create new user
            const newUser = await this.userRepo.create(userData);

            // Store the new user object in redis
            await this.redis.set(`user:${newUser._id}`, newUser);

            // Return success response
            this.logger.info(`User created successfully: ${newUser.username}`, this.signup.name);
            return {
                "statusCode": 201,
                "message": "User created successfully",
                "data": newUser
            }

        } catch (error: any) {
            this.logger.error(error.message, this.signup.name);
            return {
                "statusCode": 500,
                "message": "Failed to create user",
                "error": error.message
            }
        }
    }
}
