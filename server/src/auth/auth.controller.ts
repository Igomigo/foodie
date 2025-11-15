import { Request, Response } from "express";
import { UserSignupService } from "./userSignup/userSignup.service";
import { response } from "../interfaces/apiResponse";
import Container, { Service } from "typedi";
import { LoginService } from "./signIn/signIn.service";
import { Logger } from "../utils/logger";
import { VendorSignupService } from "./vendor-signup/vendor.signup.service";
import { RefreshTokenService } from "./refresh-token/refreshToken.service";

@Service()
export class AuthController {
  constructor(
    private readonly userSignupService: UserSignupService,
    private readonly loginService: LoginService,
    private readonly vendorSignupService: VendorSignupService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logger: Logger
  ) {}

  public async userSignup(req: Request, res: Response) {
    const data = req.body;
    const result = await this.userSignupService.signup(data);
    return response(res, result.statusCode, {
      success: result.statusCode === 201 ? true : false,
      message: result.message,
      data: result.data ? result.data : null,
      errors: result.error ? result.error : null,
    });
  }

  public async vendorSignup(req: Request, res: Response) {
    const data = req.body;
    const result = await this.vendorSignupService.signup(data);
    return response(res, result.statusCode, {
      success: result.statusCode === 201 ? true : false,
      message: result.message,
      data: result.data ? result.data : null,
      errors: result.error ? result.error : null,
    });
  }

  public async signIn(req: Request, res: Response) {
    try {
      const data = req.body;
      const result = await this.loginService.login(data);

      // Set refresh token in HttpOnly cookie
      if (result.data?.refreshToken) {
        res.cookie("refreshToken", result.data.refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production", // Over https only in production
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: "/",
        });
      }

      // Remove refresh token from response data
      const { refreshToken, ...userData } = result.data || {};

      return response(res, result.statusCode, {
        success: result.statusCode === 200 ? true : false,
        message: result.message,
        data: userData ? userData : null,
      });
    } catch (error: any) {
      this.logger.error(error.message, "AuthController");
      return response(res, 500, {
        success: false,
        message: "Login failed",
        data: null,
        errors: error.message,
      });
    }
  }

  public async refreshToken(req: Request, res: Response) {
    try {
      // Get refresh token from httpOnly cookie
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return response(res, 401, {
          success: false,
          message: "Refresh token not found",
          data: null,
        });
      }

      // Refresh the access token
      const result = await this.refreshTokenService.refreshAccessToken(
        refreshToken
      );

      return response(res, result.statusCode, {
        success: result.statusCode === 200 ? true : false,
        message: result.message,
        data: result.data ? result.data : null,
      });
    } catch (error: any) {
      this.logger.error(error.message, "AuthController");
      return response(res, 500, {
        success: false,
        message: "Failed to refresh token",
        data: null,
        errors: error.message,
      });
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      // Clear the refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      return response(res, 200, {
        success: true,
        message: "Logged out successfully",
        data: null,
      });
    } catch (error: any) {
      this.logger.error(error.message, "AuthController");
      return response(res, 500, {
        success: false,
        message: "Logout failed",
        data: null,
        errors: error.message,
      });
    }
  }
}

export const authController = Container.get(AuthController);
