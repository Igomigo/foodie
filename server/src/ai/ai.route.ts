import { Request, Response, Router } from "express";
import { Service } from "typedi";
import { AIController } from "./ai.controller";

@Service()
export class AIRoute {
  public readonly router = Router();

  constructor(private readonly aiController: AIController) {
    this.initializeRoutes();
  }

  private initializeRoutes(this: any) {
    this.router.post("/chat", (req: Request, res: Response) =>
      this.aiController.chat(req, res)
    );
  }
}
