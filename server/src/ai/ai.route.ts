import { Router } from "express";
import { AIController } from "./ai.controller";

const controller = new AIController();
export const aiRouter = Router();
aiRouter.post("/chat", (req, res) => controller.chat(req, res));
