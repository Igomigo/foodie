import { Request, Response, Router } from "express";
import { Service } from "typedi";
import { signUpSchema } from "./signup/userSignup.dto";
import { validate } from "../validators/base.validator";
import { AuthController } from "./auth.controller";
import { SignInSchema } from "./signIn/signIn.dto";

@Service()
export class AuthRoute {
    public readonly router = Router();

    constructor(
        private readonly authController: AuthController
    ) {
        this.initializeRoutes();
    }

    private initializeRoutes(this: any) {
        this.router.post('/signup',
            validate(signUpSchema),
            (req: Request, res: Response) => this.authController.signup(req, res)
        );

        this.router.post('/login',
            validate(SignInSchema),
            (req: Request, res: Response) => this.authController.signIn(req, res)
        );
    }
}
