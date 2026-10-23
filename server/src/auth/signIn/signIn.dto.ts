import Joi from "joi";
import { emailSchema, passwordSchema } from "../auth.validation";

export interface LoginInput {
  email: string;
  password: string;
}

export const SignInSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});
