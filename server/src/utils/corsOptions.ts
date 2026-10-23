import { CorsOptions } from "cors";
import { httpError } from "./httpError";

export function createCorsOptions(): CorsOptions {
  const origins = (
    process.env.CLIENT_URLS ||
    process.env.CLIENT_URL ||
    "http://localhost:3000,http://127.0.0.1:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return {
    origin(origin, callback) {
      if (!origin || origins.includes(origin)) callback(null, true);
      else callback(httpError(403, "Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
