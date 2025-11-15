import { Request, Response, Router } from "express";
import { userSignupSchema } from "./userSignup/userSignup.dto";
import { validate } from "../validators/base.validator";
import { authController } from "./auth.controller";
import { SignInSchema } from "./signIn/signIn.dto";
import { vendorSignupSchema } from "./vendor-signup/vendorSignup.dto";

const authRouter = Router();

authRouter.post("/user-signup", validate(userSignupSchema), (req: Request, res: Response) => {
  authController.userSignup(req, res);
});

authRouter.post("/vendor-signup", validate(vendorSignupSchema), (req: Request, res: Response) => {
  authController.vendorSignup(req, res);
});

authRouter.post("/login", validate(SignInSchema), (req: Request, res: Response) => {
  authController.signIn(req, res);
});

authRouter.post("/refresh-token", (req: Request, res: Response) => {
  authController.refreshToken(req, res);
});

authRouter.post("/logout", (req: Request, res: Response) => {
  authController.logout(req, res);
});

export { authRouter };
