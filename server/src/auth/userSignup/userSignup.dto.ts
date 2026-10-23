import Joi from "joi";
import { Location } from "../../domain/location.schema";
import {
  emailSchema,
  locationSchema,
  passwordSchema,
} from "../auth.validation";

export interface UserSignupInput {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  location?: Location;
}

export const userSignupSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  username: Joi.string().trim(),
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  phoneNumber: Joi.string().trim(),
  location: locationSchema,
  role: Joi.string().valid("user"),
});
