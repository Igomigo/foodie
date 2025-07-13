import { Request, Response, Router } from "express";
import { Service } from "typedi";
import { userSignupSchema } from "./signup/userSignup.dto";
import { validate } from "../validators/base.validator";
import { AuthController } from "./auth.controller";
import { SignInSchema } from "./signIn/signIn.dto";
import { vendorSignupSchema } from "./vendor-signup/vendorSignup.dto";

@Service()
export class AuthRoute {
    public readonly router = Router();

    constructor(
        private readonly authController: AuthController
    ) {
        this.initializeRoutes();
    }

    private initializeRoutes(this: any) {
        this.router.post('/user-signup',
            validate(userSignupSchema),
            (req: Request, res: Response) => this.authController.userSignup(req, res)
        );

        this.router.post('/vendor-signup',
            validate(vendorSignupSchema),
            (req: Request, res: Response) => this.authController.vendorSignup(req, res)
        );

        this.router.post('/login',
            validate(SignInSchema),
            (req: Request, res: Response) => this.authController.signIn(req, res)
        );
    }
}
