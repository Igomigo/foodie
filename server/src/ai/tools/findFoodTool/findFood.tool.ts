import { Tool } from "langchain/tools";
import { FindFoodInput } from "./findFood.schema";

class FindFoodTool extends Tool {
  name = "findFood";
  description =
    "Find food by name and location. Input should be a JSON string with 'foodName' and 'location' properties.";

  async _call(input: string): Promise<string> {
    try {
      const args: FindFoodInput = JSON.parse(input);
      const { foodName, location } = args;

      // Basic validation
      if (
        !foodName ||
        !location ||
        typeof foodName !== "string" ||
        typeof location !== "string"
      ) {
        return "Error: Both foodName and location are required as strings.";
      }

      console.log(`Finding food: ${foodName} in ${location}`);
      return `Found food: ${foodName} in ${location}`;
    } catch (error) {
      return "Error: Please provide valid JSON with foodName and location properties.";
    }
  }
}

export const findFoodTool = new FindFoodTool();
