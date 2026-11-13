import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { userController } from "./user.controller";
import { validate } from "../validators/base.validator";
import { updateLocationSchema } from "./user.validation";

export const userRouter = Router();
userRouter.patch(
  "/me/location",
  authenticate,
  validate(updateLocationSchema),
  (req, res) => userController.updateLocation(req, res),
);
userRouter.get("/:id", authenticate, (req, res) =>
  userController.getUserById(req, res),
);
