import { Service } from "typedi";
import { BaseController } from "./base.controller";
import { Request, Response, Router } from "express";

@Service()
export class BaseRoute {
    public router: Router = Router();

    constructor(
        private readonly baseController: BaseController
    ) {
        this.initializeRoutes();
    }

    private initializeRoutes (this: any) {
        this.router.get("/", (req: Request, res: Response) => 
            this.baseController.greet(req, res)
        );
    }
}
