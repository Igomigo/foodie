import { isObjectIdOrHexString } from "mongoose";
import { catalogueRepository } from "../repositories/catalogueRepository/catalogueRepo";
import { httpError } from "../utils/httpError";
import { publicMenuItem, publicVendor } from "./catalogue.presenter";
import { BrowseQuery, MenuQuery } from "./catalogue.validation";

export async function listVendors(query: BrowseQuery) {
  const vendors = await catalogueRepository.listVendors(query);
  const now = new Date();
  return {
    items: vendors
      .slice(0, query.limit)
      .map((vendor) => publicVendor(vendor, now)),
    page: query.page,
    limit: query.limit,
    hasMore: vendors.length > query.limit,
  };
}

export async function getVendor(id: string) {
  const vendor = await findVendor(id);
  return publicVendor(vendor);
}

async function findVendor(id: string) {
  if (!isObjectIdOrHexString(id)) throw httpError(400, "Invalid vendor ID");
  const vendor = await catalogueRepository.findVendor(id);
  if (!vendor) throw httpError(404, "Kitchen not found");
  return vendor;
}

export async function getVendorMenu(id: string, query: MenuQuery) {
  const vendor = await findVendor(id);
  const counts = await catalogueRepository.menuSectionCounts(id);
  const sections = [...(vendor.menuSections ?? [])]
    .sort(
      (a, b) =>
        a.position - b.position ||
        a._id.toString().localeCompare(b._id.toString()),
    )
    .map((section) => ({
      id: section._id.toString(),
      name: section.name,
      count: counts.find((entry) => entry._id?.equals(section._id))?.count ?? 0,
    }))
    .filter((section) => section.count > 0);
  const otherCount = counts
    .filter(
      (entry) =>
        !sections.some((section) => section.id === entry._id?.toString()),
    )
    .reduce((total, entry) => total + entry.count, 0);
  if (otherCount)
    sections.push({ id: "other", name: "More items", count: otherCount });
  if (
    query.section &&
    !sections.some((section) => section.id === query.section)
  )
    throw httpError(404, "Menu section not found in this kitchen");
  const items = await catalogueRepository.listVendorMenu(vendor, query);
  const now = new Date();
  return {
    vendor: publicVendor(vendor, now),
    sections,
    items: items
      .slice(0, query.limit)
      .map((item) => publicMenuItem(item, vendor, now)),
    page: query.page,
    limit: query.limit,
    hasMore: items.length > query.limit,
  };
}

export async function listMenuItems(query: BrowseQuery) {
  const items = await catalogueRepository.listMenuItems(query);
  const now = new Date();
  return {
    items: items
      .slice(0, query.limit)
      .map((item) => publicMenuItem(item, item.vendor, now)),
    page: query.page,
    limit: query.limit,
    hasMore: items.length > query.limit,
  };
}

export async function getMenuItem(id: string) {
  if (!isObjectIdOrHexString(id)) throw httpError(400, "Invalid menu item ID");
  const item = await catalogueRepository.findMenuItem(id);
  if (!item) throw httpError(404, "Meal not found");
  const now = new Date();
  return {
    item: publicMenuItem(item, item.vendor, now),
    vendor: publicVendor(item.vendor, now),
  };
}
