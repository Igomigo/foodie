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
        const result = await this.signupService.signup(data);
        return response(res, result.statusCode, {
            success: result.statusCode === 201 ? true : false,
            message: result.message,
            data: result.data ? result.data : null,
            errors: result.error ? result.error : null
        });
    }
}
