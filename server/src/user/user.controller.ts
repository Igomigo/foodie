import { Service } from "typedi";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { response } from "../interfaces/apiResponse";
import { Logger } from "../utils/logger";

@Service()
export class UserController {
    constructor(
       private readonly userService: UserService,
       private readonly logger: Logger
    ) {}

    public async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.userService.getUserById(id);
            return response(res, result.statusCode, {
                success: result.statusCode === 200 ? true : false,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            this.logger.error(`Error getting user by id: ${error}`, this.getUserById.name);
            return response(res, 500, {
                success: false,
                message: "Internal server error"
            });
        }
    }
}