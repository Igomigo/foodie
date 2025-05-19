import { Request, Response } from "express";
import { SignupService } from "./signup/signup.service";
import { response } from "../interfaces/response";
import { Service } from "typedi";

@Service()
export class AuthController {

    constructor(
        private readonly signupService: SignupService,
    ) {}

    public async signup(req: Request, res: Response) {
        const data = req.body;
        const user = await this.signupService.handler(data);
        return response(res, 201, {
            success: true,
            message: 'user created successfully',
            data: user
        });
    }
}
