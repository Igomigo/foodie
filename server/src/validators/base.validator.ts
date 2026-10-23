import { RequestHandler } from "express";
import Joi from "joi";
import { response } from "../interfaces/apiResponse";

export function validate(schema: Joi.ObjectSchema): RequestHandler {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body ?? {}, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details
        .map((detail) => detail.message.replace(/['"]/g, ""))
        .join(", ");
      response(res, 400, {
        success: false,
        message: "validation error",
        errors: message,
      });
      return;
    }
    req.body = value;
    next();
  };
}
