import { Router, Request, Response } from "express";
import { Service } from "typedi";
import { AIController } from "./ai.controller";

@Service()
export class AIRoute {
    public router: Router = Router();

    constructor(
        private readonly aiController: AIController
    ) {
        this.initializeRoutes();
    }

    private initializeRoutes(this: any) {
        this.router.post("/generate-text", (req: Request, res: Response) =>
            this.aiController.generateText(req, res)
        );
    }
}
