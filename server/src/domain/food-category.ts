export interface FoodCategory {
  id: string;
  name: string;
}
export const foodCategories =
  require("../../data/food-categories.json") as FoodCategory[];
// Keep older records and bookmarked filters readable without a data migration.
const categoryAliases: Record<string, string> = {
  "small-chops": "bakery-snacks",
};
export const foodCategoryIds = [
  ...foodCategories.map((category) => category.id),
  ...Object.keys(categoryAliases),
];
export function canonicalFoodCategory(id: string) {
  return categoryAliases[id] ?? id;
}
export function foodCategoryValues(id: string) {
  const canonical = canonicalFoodCategory(id);
  return [
    canonical,
    ...Object.keys(categoryAliases).filter(
      (alias) => categoryAliases[alias] === canonical,
    ),
  ];
}
