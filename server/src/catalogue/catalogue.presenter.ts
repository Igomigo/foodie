import { canonicalFoodCategory } from "../domain/food-category";
import { MenuItem } from "../domain/menu-item.model";
import { Vendor } from "../domain/vendor.model";
import { findNigerianLocation } from "../location/location.catalogue";
import { vendorAvailability } from "./vendor-availability";

export function publicVendor(vendor: Vendor, now = new Date()) {
  const { address } = vendor;
  const canonical = findNigerianLocation(
    address.country,
    address.state,
    address.city,
  );
  return {
    vendorId: vendor._id.toString(),
    businessName: vendor.businessName,
    description: vendor.description,
    imageUrl: vendor.imageUrl,
    bannerUrl: vendor.bannerUrl,
    logoUrl: vendor.logoUrl,
    address: {
      country: address.country,
      countryCode: address.countryCode ?? canonical?.countryCode,
      state: address.state,
      stateCode: address.stateCode ?? canonical?.stateCode,
      city: address.city,
      cityId: address.cityId ?? canonical?.cityId,
      lga: address.lga,
      lgaCode: address.lgaCode,
      area: address.area,
      street1: address.street1,
    },
    timeZone: "Africa/Lagos",
    openingHours: (vendor.openingHours ?? []).map(
      ({ day, opensAt, closesAt }) => ({ day, opensAt, closesAt }),
    ),
    ...vendorAvailability(vendor, now),
  };
}

export function publicMenuItem(
  item: MenuItem,
  vendor: Vendor,
  now = new Date(),
) {
  const options = item.options ?? [];
  const isAvailable =
    item.isAvailable === true &&
    options.every(
      (option) =>
        option.choices.filter((choice) => choice.isAvailable).length >=
        option.minSelections,
    );
  return {
    menuItemId: item._id.toString(),
    vendorId: item.vendorId.toString(),
    vendorName: vendor.businessName,
    name: item.name,
    description: item.description,
    category: canonicalFoodCategory(item.category),
    sectionId: item.sectionId?.toString(),
    imageUrl: item.imageUrl,
    price: item.price,
    currency: item.currency,
    isAvailable,
    canOrder: isAvailable && vendorAvailability(vendor, now).isAcceptingOrders,
    options: options.map((option) => ({
      optionId: option._id.toString(),
      name: option.name,
      minSelections: option.minSelections,
      maxSelections: option.maxSelections,
      choices: option.choices.map((choice) => ({
        choiceId: choice._id.toString(),
        name: choice.name,
        price: choice.price,
        isAvailable: choice.isAvailable,
      })),
    })),
  };
}
