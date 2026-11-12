export interface FoodCategory {
  id: string;
  name: string;
}

export const foodCategories =
  require("../../../shared/data/food-categories.json") as FoodCategory[];

export const foodCategoryIds = foodCategories.map((category) => category.id);
