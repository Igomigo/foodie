import { Request, Response, Router } from "express";
import { Service } from "typedi";
import { UserController } from "./user.controller";

@Service()
export class UserRoute {
    public readonly router = Router();
    
    constructor(
        private readonly userController: UserController
    ) {;
        this.initializeRoutes();
    }

    private initializeRoutes(this: any) {
        this.router.get("/:id", (req: Request, res: Response) => this.userController.getUserById(req, res));
    }
}