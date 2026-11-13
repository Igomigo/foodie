import Joi from "joi";
import { RequestHandler } from "express";
import { httpError } from "../utils/httpError";

function validateLookup(schema: Joi.ObjectSchema): RequestHandler {
  return (req, _res, next) => {
    // Keep location input out of URLs; reject query strings rather than using them.
    if (Object.keys(req.query).length)
      throw httpError(400, "Send location details in the request body");

    const { error, value } = schema.validate(req.body);
    if (error) throw httpError(400, "Invalid location lookup request");
    req.body = value;
    next();
  };
}

export const validateAddressSearch = validateLookup(
  Joi.object({
    text: Joi.string().trim().min(3).max(200).required(),
  })
    .unknown(false)
    .required(),
);

export const validateReverseLookup = validateLookup(
  Joi.object({
    latitude: Joi.number().strict().min(-90).max(90).required(),
    longitude: Joi.number().strict().min(-180).max(180).required(),
  })
    .unknown(false)
    .required(),
);
