import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { userController } from "./user.controller";

export const userRouter = Router();
userRouter.get("/:id", authenticate, (req, res) =>
  userController.getUserById(req, res),
);
