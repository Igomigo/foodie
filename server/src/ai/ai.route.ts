import { Router } from "express";
import { AIController } from "./ai.controller";
import { authenticate } from "../middleware/authenticate";

const controller = new AIController();
export const aiRouter = Router();
aiRouter.post("/chat", authenticate, (req, res) => controller.chat(req, res));
