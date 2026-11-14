import { isObjectIdOrHexString } from "mongoose";
import { Location } from "../domain/location.schema";
import { publicVendor } from "../catalogue/catalogue.presenter";
import { getVendorMenu } from "../catalogue/catalogue.service";
import { MenuQuery } from "../catalogue/catalogue.validation";
import { httpError } from "../utils/httpError";
import { discoveryDestination } from "./discovery-location";
import {
  DiscoveryKitchen,
  findDiscoveryKitchens,
} from "./discovery.repository";
import { DiscoveryQuery } from "./discovery.validation";

function presentKitchen(kitchen: DiscoveryKitchen, now: Date, nearby: boolean) {
  return {
    ...publicVendor(kitchen, now),
    categories: kitchen.categories,
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
  return {
    ...menu,
    mode: destination.mode,
    vendor: presentKitchen(kitchen, now, destination.mode === "nearby"),
    items: menu.items.map((item) => ({
      ...item,
      canOrder: item.canOrder && destination.mode === "nearby",
    })),
  };
}
