import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "../middleware/authenticate";
import { locationController } from "./location.controller";
import {
  validateAddressSearch,
  validateReverseLookup,
} from "./location.validation";

export const locationRouter = Router();

const accountLimit = rateLimit({
  windowMs: 60_000,
  limit: 30,
  keyGenerator: (_req, res) => res.locals.user.userId,
  identifier: "location-account",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many location requests. Please try again in a minute",
    data: null,
  },
});

// A conservative allowance for this process, not the provider's billing meter.
// Use a shared store before running multiple server instances.
const dailyLimit = rateLimit({
  windowMs: 24 * 60 * 60_000,
  limit: 2500,
  keyGenerator: () => "location-lookups",
  identifier: "location-daily",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Address lookup is unavailable for now. You can enter your address manually",
    data: null,
  },
});

const mapLimit = rateLimit({
  windowMs: 60_000,
  limit: 600,
  keyGenerator: (_req, res) => res.locals.user.userId,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Map requests are busy. Please try again shortly",
    data: null,
  },
});

locationRouter.get("/tiles/:z/:x/:y", authenticate, mapLimit, (req, res) =>
  locationController.tile(req, res),
);
locationRouter.use(authenticate, accountLimit);
locationRouter.post("/search", validateAddressSearch, dailyLimit, (req, res) =>
  locationController.search(req, res),
);
locationRouter.post("/reverse", validateReverseLookup, dailyLimit, (req, res) =>
  locationController.reverse(req, res),
);
