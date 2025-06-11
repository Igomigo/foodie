import Joi from "joi";

export const signUpSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    phoneNumber: Joi.string().required(),
    location: Joi.object({
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required()
    })
});
