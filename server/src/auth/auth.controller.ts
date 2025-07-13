import { Request, Response } from "express";
import { SignupService } from "./signup/userSignup.service";
import { response } from "../interfaces/apiResponse";
import { Service } from "typedi";
import { LoginService } from "./signIn/signIn.service";
import { Logger } from "../utils/logger";

@Service()
export class AuthController {

    constructor(
        private readonly signupService: SignupService,
        private readonly loginService: LoginService,
        private readonly logger: Logger
    ) {}

    public async signup(req: Request, res: Response) {
        const data = req.body;
        const result = await this.signupService.signup(data);
        return response(res, result.statusCode, {
            success: result.statusCode === 201 ? true : false,
            message: result.message,
            data: result.data ? result.data : null,
            errors: result.error ? result.error : null
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
                    path: "/"
                });
            }

            // Remove refresh token from response data
            const { refreshToken, ...userData } = result.data || {};

            return response(res, result.statusCode, {
                success: result.statusCode === 200 ? true : false,
                message: result.message,
                data: userData ? userData : null
            });
        } catch (error: any) {
            this.logger.error(error.message, 'AuthController');
            return response(res, 500, {
                success: false,
                message: "Login failed",
                data: null,
                errors: error.message
            });
        }
    }
}
