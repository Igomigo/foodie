import { z } from "zod";
import { findLocation, findLocalGovernment } from "./locations";
import type { SavedLocation } from "@/types/user";

export const locationFields = {
  country: z.literal("Nigeria", {
    errorMap: () => ({ message: "Foodie is currently available in Nigeria" }),
  }),
  state: z.string().min(1, "Choose your state"),
  city: z.string().min(1, "Choose your city or area"),
  lga: z.string().min(1, "Choose your local government area"),
  area: z.string().trim().max(100, "Use at most 100 characters"),
};
export type LocationInput = {
  country: "Nigeria";
  state: string;
  city: string;
  lga: string;
  area: string;
};

export function validateLocation(
  data: LocationInput,
  context: z.RefinementCtx,
) {
  if (data.state && data.city && !findLocation(data.state, data.city))
    context.addIssue({
      code: "custom",
      path: ["city"],
      message: "Choose a city in your selected state",
    });
  if (data.lga && !findLocalGovernment(data.state, data.lga))
    context.addIssue({
      code: "custom",
      path: ["lga"],
      message: "Choose an LGA in your selected state",
    });
}
export const locationInputSchema = z
  .object(locationFields)
  .superRefine(validateLocation);

export function toSavedLocation(data: LocationInput): SavedLocation {
  const location = findLocation(data.state, data.city);
  const lga = findLocalGovernment(data.state, data.lga);
  if (!location || !lga) throw new Error("Choose a valid location");
  return {
    ...location,
    lga: lga.name,
    lgaCode: lga.id,
    area: data.area.trim(),
  };
}
