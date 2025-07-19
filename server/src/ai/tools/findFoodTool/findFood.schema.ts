import { z } from "zod";

// Defines and documents the inputs the find food tool expects
export const findFoodSchema = z.object({
  // The name of the food to find
  foodName: z
    .string()
    .min(1, "Food name cannot be empty")
    .describe("The name of the food to find, e.g rice, suya, etc"),
  // The location of the food to find
  location: z
    .string()
    .min(1, "Location cannot be empty")
    .describe("The location of the food to find, e.g Lagos, Abuja, etc"),
});

export type FindFoodInput = z.infer<typeof findFoodSchema>;
