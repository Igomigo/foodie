import Joi from "joi";

export const vendorSignupSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
    location: Joi.object({
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required()
    }),
    role: Joi.string().required().valid("vendor")
});
