import { CookieOptions, Request, Response } from "express";
import { response } from "../interfaces/apiResponse";
import { signupUser } from "./userSignup/userSignup.service";
import { signupVendor } from "./vendor-signup/vendor.signup.service";
import { login } from "./signIn/signIn.service";
import { refreshAccessToken } from "./refresh-token/refreshToken.service";
import { httpError } from "../utils/httpError";

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export class AuthController {
  async userSignup(req: Request, res: Response) {
    const user = await signupUser(req.body);
    return response(res, 201, {
      success: true,
      message: "User account created successfully",
      data: user,
    });
  }

  async vendorSignup(req: Request, res: Response) {
    const user = await signupVendor(req.body);
    return response(res, 201, {
      success: true,
      message: "Vendor created successfully",
      data: user,
    });
  }

  async signIn(req: Request, res: Response) {
    const { refreshToken, ...user } = await login(req.body);
    res.cookie("refreshToken", refreshToken, {
      ...refreshCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return response(res, 200, {
      success: true,
      message: "Login successful",
      data: user,
    });
  }

  async refreshToken(req: Request, res: Response) {
    const token: unknown = req.cookies?.refreshToken;
    if (typeof token !== "string" || !token)
      throw httpError(401, "Refresh token not found");
    const data = await refreshAccessToken(token);
    // Keep the envelope, plus the top-level token expected by the existing client interceptor.
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data,
      accessToken: data.accessToken,
    });
  }

  logout(_req: Request, res: Response) {
    res.clearCookie("refreshToken", refreshCookieOptions());
    return response(res, 200, {
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  }
}

export const authController = new AuthController();
