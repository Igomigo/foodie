import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { userController } from "./user.controller";
import Joi from "joi";
import { validate } from "../validators/base.validator";
import { locationSchema } from "../auth/auth.validation";

export const userRouter = Router();
userRouter.patch(
  "/me/location",
  authenticate,
  validate(Joi.object({ location: locationSchema.required() })),
  (req, res) => userController.updateLocation(req, res),
);
userRouter.get("/:id", authenticate, (req, res) =>
  userController.getUserById(req, res),
);
