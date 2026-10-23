import { Router } from "express";
import { validate } from "../validators/base.validator";
import { authController } from "./auth.controller";
import { userSignupSchema } from "./userSignup/userSignup.dto";
import { vendorSignupSchema } from "./vendor-signup/vendorSignup.dto";
import { SignInSchema } from "./signIn/signIn.dto";

export const authRouter = Router();

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
