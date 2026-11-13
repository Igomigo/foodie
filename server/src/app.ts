import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createBaseRouter } from "./base/base.route";
import { authRouter } from "./auth/auth.route";
import { userRouter } from "./user/user.route";
import { aiRouter } from "./ai/ai.route";
import { catalogueRouter } from "./catalogue/catalogue.route";
import { locationRouter } from "./location/location.route";
import { createCorsOptions } from "./utils/corsOptions";
import { errorHandler } from "./middleware/errorHandler";
import { response } from "./interfaces/apiResponse";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors(createCorsOptions()));
  app.use(helmet());
  app.use("/api/v1/locations", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  if (process.env.NODE_ENV !== "test") {
    const requestLogger = morgan("dev");
    // Even rejected requests may contain private details in their query string.
    const locationLogger = morgan(
      ":method /api/v1/locations :status :response-time ms",
    );
    app.use((req, res, next) => {
      const isLocationRequest = /^\/api\/v1\/locations(?:\/|$)/i.test(req.path);
      return (isLocationRequest ? locationLogger : requestLogger)(
        req,
        res,
        next,
      );
    });
  }
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  app.use("/api/v1", createBaseRouter());
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/ai", aiRouter);
  app.use("/api/v1", catalogueRouter);
  app.use("/api/v1/locations", locationRouter);
  app.use((_req, res) =>
    response(res, 404, { success: false, message: "Route not found" }),
  );
  app.use(errorHandler);
  return app;
}
