import "dotenv/config";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";
import mongoose, { Types } from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/mongo";
import { UserModel } from "../domain/user.model";
import { VendorModel } from "../domain/vendor.model";
import { MenuItemModel } from "../domain/menu-item.model";
import {
  findNigerianCity,
  findNigerianState,
} from "../location/location.catalogue";
import { seedKitchens, seedMeals } from "./catalogue.data";

export function assertLocalSeed(
  uri: string,
  environment = process.env.NODE_ENV,
) {
  if (environment === "production")
    throw new Error("Catalogue seeding is disabled in production");
  // Only an explicit, single local MongoDB host is allowed, including credentials.
  const host = uri.match(
    /^mongodb:\/\/(?:[^/@]+@)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\//i,
  );
  if (!host)
    throw new Error("Catalogue seeding requires a local MongoDB connection");
}

// Keep the original namespace so repeat runs update existing seeded records.
function catalogueId(key: string) {
  return new Types.ObjectId(
    createHash("sha256")
      .update(`foodie-demo:${key}`)
      .digest("hex")
      .slice(0, 24),
  );
}

export async function seedCatalogue(apply = false) {
  assertLocalSeed(process.env.MONGODB_URI || "");
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
  const records = seedKitchens.map((kitchen) => {
    const state = findNigerianState(kitchen.state);
    const city = state && findNigerianCity(state.code, kitchen.city);
    if (!state || !city) throw new Error(`Unknown seed city: ${kitchen.city}`);
    const owner = new UserModel({
      _id: catalogueId(`owner:${kitchen.slug}`),
      email: `${kitchen.slug}@foodie-demo.example.com`,
      passwordHash,
      roles: ["user", "vendor"],
      isActive: true,
    });
    const sectionNames: Record<string, string> = {
      rice: kitchen.slug === "rice-room" ? "Rice specials" : "Meals",
      "soups-swallows": "Soups & swallows",
      grills: "Protein",
      "bakery-snacks": "Bakery & snacks",
      "pasta-noodles": "Pasta & noodles",
      "beans-yam": "Beans & yam",
      breakfast: "Breakfast",
      desserts: "Desserts",
      drinks: "Drinks",
    };
    const sectionCategories = [
      ...new Set(kitchen.meals.map((key) => seedMeals[key].category)),
    ];
    const menuSections = sectionCategories.map((category, position) => ({
      _id: catalogueId(`section:${kitchen.slug}:${category}`),
      name: sectionNames[category],
      position,
    }));
    const vendor = new VendorModel({
      _id: catalogueId(`vendor:${kitchen.slug}`),
      ownerId: owner._id,
      businessName: kitchen.name,
      description: kitchen.description,
      bannerUrl: `/images/kitchens/${kitchen.slug}-cover.webp`,
      logoUrl: `/images/kitchens/${kitchen.slug}-logo.svg`,
      menuSections,
      approvalStatus: kitchen.approvalStatus ?? "approved",
      acceptingOrders: kitchen.acceptingOrders ?? true,
      deliveryRadiusMeters: kitchen.radius,
      openingHours: Array.from({ length: 7 }, (_, day) => ({
        day,
        opensAt: kitchen.opensAt ?? "08:00",
        closesAt: kitchen.closesAt ?? "22:00",
      })),
      address: {
        country: "Nigeria",
        countryCode: "NG",
        state: state.name,
        stateCode: state.code,
        city: city.name,
        cityId: city.id,
        area: kitchen.area,
        point: { type: "Point", coordinates: kitchen.coordinates },
      },
    });
    const items = kitchen.meals.map(
      (key) =>
        new MenuItemModel({
          _id: catalogueId(`meal:${kitchen.slug}:${key}`),
          vendorId: vendor._id,
          ...seedMeals[key],
          sectionId: catalogueId(
            `section:${kitchen.slug}:${seedMeals[key].category}`,
          ),
          isPublished: true,
          isAvailable: !(kitchen.slug === "rice-room" && key === "chops"),
          options:
            key === "jollof"
              ? [
                  {
                    name: "Extra plantain",
                    minSelections: 0,
                    maxSelections: 1,
                    choices: [
                      {
                        _id: catalogueId(`choice:${kitchen.slug}:dodo`),
                        name: "Add dodo",
                        price: 80000,
                        isAvailable: true,
                      },
                    ],
                  },
                ]
              : [],
        }),
    );
    return { owner, vendor, items };
  });
  for (const { owner, vendor, items } of records)
    await Promise.all([
      owner.validate(),
      vendor.validate(),
      ...items.map((item) => item.validate()),
    ]);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const { owner, vendor, items } of records) {
        const existingOwner = await UserModel.findOne({
          $or: [{ _id: owner._id }, { email: owner.email }],
        }).session(session);
        const existingVendor = await VendorModel.findOne({
          $or: [{ _id: vendor._id }, { ownerId: owner._id }],
        }).session(session);
        if (
          existingOwner &&
          (!existingOwner._id.equals(owner._id) ||
            existingOwner.email !== owner.email ||
            !existingOwner.roles.includes("vendor"))
        )
          throw new Error("Seed owner conflicts with an existing account");
        if (
          existingVendor &&
          (!existingVendor._id.equals(vendor._id) ||
            !existingVendor.ownerId.equals(owner._id))
        )
          throw new Error("Seed kitchen conflicts with an existing business");
        for (const item of items) {
          const existingItem = await MenuItemModel.findById(item._id).session(
            session,
          );
          if (existingItem && !existingItem.vendorId.equals(vendor._id))
            throw new Error("Seed meal conflicts with an existing menu");
        }
        if (!apply) continue;
        // Existing users are never updated, even on repeat runs.
        if (!existingOwner) await owner.save({ session });
        const vendorData = vendor.toObject();
        await VendorModel.replaceOne(
          { _id: vendor._id },
          { ...vendorData, createdAt: existingVendor?.createdAt },
          { upsert: true, session },
        );
        for (const item of items)
          await MenuItemModel.replaceOne({ _id: item._id }, item.toObject(), {
            upsert: true,
            session,
          });
      }
    });
  } finally {
    await session.endSession();
  }
  return {
    kitchens: records.length,
    meals: records.reduce((count, record) => count + record.items.length, 0),
    applied: apply,
  };
}

async function main() {
  assertLocalSeed(process.env.MONGODB_URI || "");
  await connectDatabase();
  const result = await seedCatalogue(process.argv.includes("--apply"));
  console.log(
    `${result.applied ? "Seeded" : "Dry run:"} ${result.kitchens} kitchens and ${result.meals} meals. Existing customer accounts are untouched.`,
  );
  if (!result.applied)
    console.log("Run with --apply to write the development catalogue.");
}
if (require.main === module) {
  main()
    .catch(() => {
      console.error(
        "Catalogue seeding failed. Check the local database and seed record conflicts.",
      );
      process.exitCode = 1;
    })
    .finally(disconnectDatabase);
}
