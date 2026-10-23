import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { response } from "../interfaces/apiResponse";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (res.headersSent) return next(error);

  let status = 500;
  let message = "Internal server error";
  if (
    error instanceof mongoose.mongo.MongoServerError &&
    error.code === 11000
  ) {
    status = 409;
    message = "An account with these details already exists";
  } else if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError
  ) {
    status = 400;
    message = "Invalid request data";
  } else if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  ) {
    status = error.status;
    message =
      error instanceof SyntaxError ? "Invalid JSON body" : error.message;
  }

  if (status === 500)
    logger.error(
      error instanceof Error ? error.message : String(error),
      "Request",
    );
  response(res, status, { success: false, message, data: null });
};
