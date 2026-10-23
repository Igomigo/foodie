import { Router } from "express";
import { validate } from "../validators/base.validator";
import { authController } from "./auth.controller";
import { userSignupSchema } from "./userSignup/userSignup.dto";
import { vendorSignupSchema } from "./vendor-signup/vendorSignup.dto";
import { SignInSchema } from "./signIn/signIn.dto";
import { rateLimit } from "express-rate-limit";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./password-reset/passwordReset.dto";

export const authRouter = Router();

const recoveryLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many recovery attempts. Please try again in 15 minutes",
  },
});

authRouter.post(
  "/forgot-password",
  recoveryLimit,
  validate(forgotPasswordSchema),
  (req, res) => authController.forgotPassword(req, res),
);
authRouter.post(
  "/reset-password",
  recoveryLimit,
  validate(resetPasswordSchema),
  (req, res) => authController.resetPassword(req, res),
);

authRouter.post("/user-signup", validate(userSignupSchema), (req, res) =>
  authController.userSignup(req, res),
);
authRouter.post("/vendor-signup", validate(vendorSignupSchema), (req, res) =>
  authController.vendorSignup(req, res),
);
authRouter.post("/login", validate(SignInSchema), (req, res) =>
  authController.signIn(req, res),
);
authRouter.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res),
);
authRouter.post("/logout", (req, res) => authController.logout(req, res));
