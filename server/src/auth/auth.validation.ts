import Joi from "joi";
import {
  findNigerianLocation,
  findLocalGovernment,
} from "../location/location.catalogue";

export const emailSchema = Joi.string().trim().lowercase().email().required();
export const passwordSchema = Joi.string()
  .min(6)
  .required()
  .custom((value: string, helpers) =>
    Buffer.byteLength(value, "utf8") <= 72
      ? value
      : helpers.error("any.invalid"),
  )
  .messages({ "any.invalid": "Password must be at most 72 bytes" });

export const locationSchema = Joi.object({
  country: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  street1: Joi.string().trim(),
  street2: Joi.string().trim(),
  zip: Joi.string().trim(),
  countryCode: Joi.string().valid("NG"),
  stateCode: Joi.string(),
  cityId: Joi.number().integer(),
  lga: Joi.string().trim().max(100),
  lgaCode: Joi.string().trim(),
  area: Joi.string().trim().max(100).allow(""),
  point: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array()
      .ordered(
        Joi.number().min(-180).max(180).required(),
        Joi.number().min(-90).max(90).required(),
      )
      .length(2)
      .required(),
  }),
  accuracyMeters: Joi.number().min(0).max(100000),
})
  .with("lgaCode", "lga")
  .with("accuracyMeters", "point")
  .custom((value, helpers) => {
    const location = findNigerianLocation(
      value.country,
      value.state,
      value.city,
    );
    if (
      !location ||
      (value.stateCode && value.stateCode !== location.stateCode) ||
      (value.cityId !== undefined && value.cityId !== location.cityId)
    ) {
      return helpers.error("any.invalid");
    }
    if (value.lga) {
      const lga = findLocalGovernment(location.stateCode, value.lga);
      if (!lga || (value.lgaCode && value.lgaCode !== lga.id))
        return helpers.error("any.invalid");
      value = { ...value, lga: lga.name, lgaCode: lga.id };
    }
    return { ...value, ...location };
  })
  .messages({
    "any.invalid": "Choose a valid Nigerian state and a city in that state",
  });
