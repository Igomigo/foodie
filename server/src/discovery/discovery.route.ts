import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { discoveryController } from "./discovery.controller";

export const discoveryRouter = Router();
discoveryRouter.use(authenticate);
discoveryRouter.get("/feed", (req, res) => discoveryController.feed(req, res));
discoveryRouter.get("/meals", (req, res) =>
  discoveryController.meals(req, res),
);
discoveryRouter.get("/kitchens", (req, res) =>
  discoveryController.kitchens(req, res),
);
discoveryRouter.get("/kitchens/:id/meals/:mealId", (req, res) =>
  discoveryController.meal(req, res),
);
discoveryRouter.get("/kitchens/:id/menu", (req, res) =>
  discoveryController.menu(req, res),
);
