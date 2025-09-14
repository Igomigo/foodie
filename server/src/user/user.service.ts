import { Service } from "typedi";
import { UserRepository } from "../repositories/userRepository/userRepo";
import { User } from "../domain/user.model";
import { Logger } from "../utils/logger";
import { RedisService } from "../services/redisService";
import { serviceResponse } from "../interfaces/serviceResponse";

@Service()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: Logger,
    private readonly redis: RedisService
  ) {}

  public async getUserById(id: string): Promise<serviceResponse<User>> {
    try {
      let user;

      // Get user from redis store
      user = await this.redis.get<User>(`user:${id}`);

      // If not found in redis, check in db
      if (!user) {
        user = await this.userRepo.findById(id);
        if (user) {
          await this.redis.set(`user:${id}`, user);
        }
      }

      if (!user) {
        return {
          statusCode: 404,
          message: "User not found",
        };
      }

      return {
        statusCode: 200,
        message: "User found",
        data: user,
      };
    } catch (error) {
      this.logger.error(
        `Error getting user by id: ${error}`,
        this.getUserById.name
      );
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }
}
