import Joi from "joi";

export const vendorSignupSchema = Joi.object({
    businessName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    location: Joi.object({
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        street1: Joi.string().required(),
        street2: Joi.string().optional(),
        zip: Joi.string().required()
    }),
    role: Joi.string().required().valid("vendor")
});
