import Joi from "joi";

export const userSignupSchema = Joi.object({
  username: Joi.string().optional(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  phoneNumber: Joi.string().optional(),
  location: Joi.object({
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    street1: Joi.string().optional(),
    street2: Joi.string().optional(),
    zip: Joi.string().optional(),
  }),
  role: Joi.string().required().valid("user"),
});
