import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { discoveryController } from "./discovery.controller";

export const discoveryRouter = Router();
discoveryRouter.use(authenticate);
discoveryRouter.get("/kitchens", (req, res) =>
  discoveryController.kitchens(req, res),
);
discoveryRouter.get("/kitchens/:id/menu", (req, res) =>
  discoveryController.menu(req, res),
);
