import Joi from "joi";
import { Location } from "../../domain/location.schema";
import {
  emailSchema,
  locationSchema,
  passwordSchema,
  phoneSchema,
} from "../auth.validation";

export interface VendorSignupInput {
  email: string;
  password: string;
  businessName: string;
  businessPhone?: string;
  location: Location;
}

export const vendorSignupSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  businessName: Joi.string().trim().required(),
  businessPhone: phoneSchema,
  location: locationSchema.required(),
  role: Joi.string().valid("vendor"),
});
