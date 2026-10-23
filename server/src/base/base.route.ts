import { Router } from "express";
import Joi from "joi";
import { baseController } from "./base.controller";
import { validate } from "../validators/base.validator";

export function createBaseRouter() {
  const router = Router();
  router.get("/", (req, res) => baseController.greet(req, res));
  // These are development demos, not account-management endpoints.
  if (process.env.NODE_ENV === "development") {
    router.post(
      "/set-user",
      validate(Joi.object({ id: Joi.string().required() }).unknown()),
      (req, res) => baseController.setUser(req, res),
    );
    router.get("/get-user/:key", (req, res) =>
      baseController.getUser(req, res),
    );
  }
  return router;
}
