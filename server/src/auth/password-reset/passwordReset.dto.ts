import Joi from "joi";
import { emailSchema, passwordSchema } from "../auth.validation";

export const forgotPasswordSchema = Joi.object({ email: emailSchema });
export const resetPasswordSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});
