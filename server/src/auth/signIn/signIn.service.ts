import { Service } from "typedi";
import { AccountRepository } from "../../repositories/accountRepository/accountRepo";
import { Logger } from "../../utils/logger";
import { User } from "../../domain/user.model";
import { JwtService } from "../../utils/jwt";
import { Bcrypt } from "../../utils/hashPassword";

@Service()
export class LoginService {
    constructor(
        private readonly accountRepo: AccountRepository,
        private readonly logger: Logger,
        private readonly jwtService: JwtService,
        private readonly bcrypt: Bcrypt
    ) {}

    async login(data: User) {
        try {
            // Check if user exists
            const user = await this.accountRepo.findByEmail(data.email);
            if (!user) {
                return {
                    statusCode: 404,
                    message: "User not found"
                }
            }

            // Check if password is correct
            const isValid = await this.bcrypt.compare(data.password, user.password);
            if (!isValid) {
                return {
                    statusCode: 400,
                    message: "Invalid password"
                };
            }

            // Generate tokens
            const accessToken = await this.jwtService.generateAccessToken({ userId: user._id });
            const refreshToken = await this.jwtService.generateRefreshToken({ userId: user._id });

            // Return success response
            const userData = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            }
            return {
                statusCode: 200,
                message: "Login successful",
                data: userData
            }
        } catch (error: any) {
            this.logger.error(error.message, "LoginService");
            return {
                statusCode: 500,
                message: "Login failed"
            }
        }
    }
}
