import { AccountRepository } from "../../repositories/accountRepository/accountRepo";
import { Service } from "typedi";
import { Logger } from "../../utils/logger";
import { Vendor } from "../../domain/vendor.model";
import { RedisService } from "../../services/redisService";

@Service()
export class VendorSignup {
    constructor(
        private readonly accountRepo: AccountRepository,
        private readonly logger: Logger,
        private readonly redis: RedisService
    ) {}

    public async signup(data: Vendor) {
        try {
            // Check if user already exists
            const user = await this.accountRepo.findByEmail(data.email);
            if (user) {
                return {
                    "statusCode": 409,
                    "message": "User already exists"
                }
            }
        } catch (error: any) {
            this.logger.error(error.message, "Vendor Signup");
            return {
                "statusCode": 500,
                "message": "Internal server error"
            }
        }
    }
}