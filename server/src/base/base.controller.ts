import { Service } from "typedi";
import { BaseService } from "./base.service";
import { Request, Response } from "express";
import { response } from "../interfaces/response";
import { Logger } from "../utils/logger";

@Service()
export class BaseController {
    constructor(
        private readonly baseService: BaseService,
        private readonly logger: Logger
    ) {}

    public async greet(req: Request, res: Response) {
        const message = await this.baseService.greet();
        this.logger.log(message, this);
        return response(res, 200, {success: true, message: message});
    }

    public async setUser(req: Request, res: Response) {
        const user = req.body;
        const result = await this.baseService.setUser(user);
        return response(res, 201, {success: true, message: "User set successfully", data: result});
    }

    public async getUser(req: Request, res: Response) {
        const key = req.params.key;
        const result = await this.baseService.getUser(key);
        return response(res, 200, {success: true, message: "User fetched successfully", data: result});
    }
}
