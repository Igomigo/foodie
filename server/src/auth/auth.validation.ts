import Joi from "joi";

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
});
