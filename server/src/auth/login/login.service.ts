import { Service } from "typedi";
import { UserRepository } from "../../repositories/userRepository/userRepo";
import { Logger } from "../../utils/logger";
import { User } from "../../user/domain/user.model";
import { serviceResponse } from "../../interfaces/serviceResponse";
import * as bcrypt from "bcrypt";
import { JwtService } from "../../utils/jwt";

@Service()
export class LoginService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly logger: Logger,
        private readonly jwtService: JwtService
    ) {}

    async login(data: User) {
        try {
            // Check if user exists
            const user = await this.userRepo.findByEmail(data.email);
            if (!user) {
                return {
                    statusCode: 404,
                    message: "User not found"
                }
            }

            // Check if password is correct
            const isValid = await bcrypt.compare(data.password, user.password);
            if (!isValid) {
                return {
                    statusCode: 400,
                    message: "Invalid password"
                };
            }

            // Generate token
            const accessToken = await this.jwtService.generateAccessToken({ userId: user._id });
            const refreshToken = await this.jwtService.generateRefreshToken({ userId: user._id });

            // Return success response
            return {
                statusCode: 200,
                message: "Login successful",
                data: {
                    user,
                    accessToken,
                    refreshToken
                }
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
