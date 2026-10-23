import { DynamicTool } from "langchain/tools";
import { findFoodSchema } from "./findFood.schema";

export const findFoodTool = new DynamicTool({
  name: "findFood",
  description:
    "Find food by name and location. Input should be a JSON string with 'foodName' and 'location' properties.",
  async func(input: string): Promise<string> {
    try {
      const result = findFoodSchema.safeParse(JSON.parse(input));
      if (!result.success)
        return "Error: Both foodName and location are required as strings.";
      const { foodName, location } = result.data;
      return `Found food: ${foodName} in ${location}`;
    } catch {
      return "Error: Please provide valid JSON with foodName and location properties.";
    }
  },
});
