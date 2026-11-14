import { foodCategories, canonicalFoodCategory } from "../domain/food-category";
import { isObjectIdOrHexString } from "mongoose";
import { Location } from "../domain/location.schema";
import { publicMenuItem, publicVendor } from "../catalogue/catalogue.presenter";
import { getVendorMenu, getMenuItem } from "../catalogue/catalogue.service";
import { MenuQuery } from "../catalogue/catalogue.validation";
import { httpError } from "../utils/httpError";
import { discoveryDestination } from "./discovery-location";
import {
  DiscoveryKitchen,
  findDiscoveryKitchens,
} from "./discovery.repository";
import {
  findDiscoveryMeals,
  findDiscoveryCategories,
} from "./discovery-meals.repository";
import { DiscoveryQuery } from "./discovery.validation";

function presentKitchen(kitchen: DiscoveryKitchen, now: Date, nearby: boolean) {
  return {
    ...publicVendor(kitchen, now),
    categories: [...new Set(kitchen.categories.map(canonicalFoodCategory))],
    distanceMeters: nearby
      ? Math.round(kitchen.distanceMeters! / 100) * 100
      : null,
    canDeliver: nearby ? true : null,
  };
}

export async function discoverKitchens(
  location: Location | undefined,
  query: DiscoveryQuery,
  now = new Date(),
) {
  const destination = discoveryDestination(location);
  const kitchens =
    destination.mode === "location-required"
      ? []
      : await findDiscoveryKitchens(destination, query, now);
  return {
    mode: destination.mode,
    city: destination.city,
    items: kitchens
      .slice(0, query.limit)
      .map((kitchen) =>
        presentKitchen(kitchen, now, destination.mode === "nearby"),
      ),
    page: query.page,
    limit: query.limit,
    hasMore: kitchens.length > query.limit,
  };
}

export async function discoverKitchenMenu(
  location: Location | undefined,
  id: string,
  query: MenuQuery,
  now = new Date(),
) {
  if (!isObjectIdOrHexString(id)) throw httpError(400, "Invalid kitchen ID");
  const destination = discoveryDestination(location);
  if (destination.mode === "location-required")
    throw httpError(409, "Add your location to browse kitchen menus");
  const [kitchen] = await findDiscoveryKitchens(
    destination,
    { page: 1, limit: 1, openOnly: false },
    now,
    id,
  );
  if (!kitchen)
    throw httpError(
      404,
      "This kitchen is not available at your selected address",
    );
  const menu = await getVendorMenu(id, query);
  const vendor = presentKitchen(kitchen, now, destination.mode === "nearby");
  return {
    ...menu,
    mode: destination.mode,
    vendor,
    items: menu.items.map((item) => ({
      ...item,
      canOrder:
        item.isAvailable &&
        vendor.isAcceptingOrders &&
        destination.mode === "nearby",
    })),
  };
}

export async function discoverMeals(
  location: Location | undefined,
  query: DiscoveryQuery,
  now = new Date(),
  limitPerKitchen?: number,
) {
  const destination = discoveryDestination(location);
  const meals =
    destination.mode === "location-required"
      ? []
      : await findDiscoveryMeals(destination, query, now, limitPerKitchen);
  return {
    mode: destination.mode,
    city: destination.city,
    page: query.page,
    limit: query.limit,
    hasMore: meals.length > query.limit,
    items: meals.slice(0, query.limit).map((meal) => {
      const item = publicMenuItem(meal, meal.kitchen, now);
      return {
        ...item,
        canOrder: item.canOrder && destination.mode === "nearby",
        kitchen: presentKitchen(
          { ...meal.kitchen, categories: [] },
          now,
          destination.mode === "nearby",
        ),
      };
    }),
  };
}
export async function discoveryFeed(
  location: Location | undefined,
  now = new Date(),
) {
  const destination = discoveryDestination(location);
  const [counts, meals] = await Promise.all([
    destination.mode === "location-required"
      ? []
      : findDiscoveryCategories(destination),
    discoverMeals(location, { page: 1, limit: 30, openOnly: true }, now, 4),
  ]);
  const categories = foodCategories
    .map((category) => ({
      ...category,
      count: counts
        .filter((entry) => canonicalFoodCategory(entry._id) === category.id)
        .reduce((total, entry) => total + entry.count, 0),
    }))
    .filter((category) => category.count > 0);
  // Take turns between kitchens so one large menu cannot fill every visible card.
  const byKitchen = new Map<string, typeof meals.items>();
  for (const meal of meals.items.filter((item) => item.isAvailable)) {
    const group = byKitchen.get(meal.vendorId) ?? [];
    group.push(meal);
    byKitchen.set(meal.vendorId, group);
  }
  const varied: typeof meals.items = [];
  while (
    varied.length < 12 &&
    [...byKitchen.values()].some((group) => group.length)
  ) {
    for (const group of byKitchen.values()) {
      const meal = group.shift();
      if (meal && varied.length < 12) varied.push(meal);
    }
  }
  return { mode: destination.mode, categories, meals: varied };
}

export async function discoveryMeal(
  location: Location | undefined,
  vendorId: string,
  mealId: string,
  now = new Date(),
) {
  if (!isObjectIdOrHexString(vendorId) || !isObjectIdOrHexString(mealId))
    throw httpError(400, "Invalid kitchen or meal ID");
  const destination = discoveryDestination(location);
  if (destination.mode === "location-required")
    throw httpError(409, "Add your location to browse meals");
  const [kitchen] = await findDiscoveryKitchens(
    destination,
    { page: 1, limit: 1, openOnly: false },
    now,
    vendorId,
  );
  if (!kitchen)
    throw httpError(404, "Meal not available at your selected address");
  const { item } = await getMenuItem(mealId);
  if (item.vendorId !== vendorId)
    throw httpError(404, "Meal not found in this kitchen");
  return {
    ...item,
    canOrder:
      item.isAvailable &&
      publicVendor(kitchen, now).isAcceptingOrders &&
      destination.mode === "nearby",
  };
}
