import { AccountRepository } from "../../repositories/accountRepository/accountRepo";
import { Service } from "typedi";
import { Logger } from "../../utils/logger";
import { Vendor } from "../../domain/vendor.model";
import { RedisService } from "../../services/redisService";
import { Bcrypt } from "../../utils/hashPassword";

@Service()
export class VendorSignupService {
    constructor(
        private readonly accountRepo: AccountRepository,
        private readonly logger: Logger,
        private readonly redis: RedisService,
        private readonly bcrypt: Bcrypt
    ) {}

    public async signup(data: Vendor) {
        try {
            // Check if user already exists
            const vendor = await this.accountRepo.findByEmail(data.email);
            if (vendor) {
                return {
                    "statusCode": 409,
                    "message": "Vendor already exists"
                }
            }

            // Hash password
            const hashedPwd = await this.bcrypt.hash(data.password);

            // Create new user
            const newVendor = await this.accountRepo.create({
                ...data,
                password: hashedPwd,
            });

            // Store the new user object in redis
            await this.redis.set(`vendor:${newVendor._id}`, newVendor);

            // Return success response
            this.logger.info(`Vendor created successfully: ${newVendor.email}`, "Vendor Signup");
            return {
                "statusCode": 201,
                "message": "Vendor created successfully",
                "data": newVendor
            }

        } catch (error: any) {
            this.logger.error(error.message, "Vendor Signup");
            return {
                "statusCode": 500,
                "message": "Failed to create vendor account",
                "error": error.message
            }
        }
    }
}