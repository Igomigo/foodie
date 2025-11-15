import { Service } from "typedi";
import { Logger } from "../../utils/logger";
import { JwtService } from "../../utils/jwt";
import { AccountRepository } from "../../repositories/accountRepository/accountRepo";

@Service()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountRepo: AccountRepository,
    private readonly logger: Logger
  ) {}

  /**
   * Refreshes the access token using the refresh token from the cookie
   * @param refreshToken - The refresh token from the httpOnly cookie
   * @returns New access token or error
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const decoded = await this.jwtService.verify(refreshToken);

      if (!decoded || !decoded.userId) {
        return {
          statusCode: 401,
          message: "Invalid refresh token",
        };
      }

      // Check if user still exists
      const user = await this.accountRepo.findById(decoded.userId);
      if (!user) {
        return {
          statusCode: 404,
          message: "User not found",
        };
      }

      // Generate new access token
      const newAccessToken = await this.jwtService.generateAccessToken({
        userId: user._id,
        role: user.role,
      });

      return {
        statusCode: 200,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
        },
      };
    } catch (error: any) {
      this.logger.error(error.message, "RefreshTokenService");
      
      // Check if error is due to token expiration
      if (error.message.includes("jwt expired") || error.message.includes("invalid token")) {
        return {
          statusCode: 401,
          message: "Refresh token expired or invalid",
        };
      }

      return {
        statusCode: 500,
        message: "Failed to refresh token",
      };
    }
  }
}

