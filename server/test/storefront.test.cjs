const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const { startTestDatabase } = require("./support/database.cjs");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "isolated-storefront-test-secret";
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { seedDemoCatalogue } = require("../src/scripts/seedDemoCatalogue");
const { VendorModel } = require("../src/domain/vendor.model");
const { MenuItemModel } = require("../src/domain/menu-item.model");
const { UserModel } = require("../src/domain/user.model");
const { foodCategories } = require("../src/domain/food-category");
const {
  discoverKitchens,
  discoverKitchenMenu,
  discoverMeals,
  discoveryFeed,
} = require("../src/discovery/discovery.service");
const { createApp } = require("../src/app");
const { generateAccessToken } = require("../src/utils/jwt");
const query = { page: 1, limit: 30, openOnly: false };
const location = {
  country: "Nigeria",
  state: "Edo",
  city: "Benin City",
  point: { type: "Point", coordinates: [5.62, 6.32] },
  confirmedAt: new Date(),
  street1: "Public test landmark",
};

test(
  "kitchen storefronts and local meal discovery",
  { timeout: 60000 },
  async (t) => {
    const database = await startTestDatabase();
    let server;
    t.after(async () => {
      if (server) {
        server.closeAllConnections();
        await new Promise((r) => server.close(r));
      }
      if (mongoose.connection.readyState === 1)
        await mongoose.connection.dropDatabase();
      await disconnectDatabase();
      await database.stop();
    });
    process.env.MONGODB_URI = database.uri;
    await connectDatabase();
    await seedDemoCatalogue(true);
    const vendors = await VendorModel.find().lean();
    const osas = vendors.find((v) => v.businessName === "Osas Kitchen");
    const rice = vendors.find((v) => v.businessName === "The Rice Room");
    const customer = await UserModel.create({
      email: "storefront-customer@example.com",
      passwordHash: "test-only",
      location,
    });
    const token = generateAccessToken({
      userId: customer.id,
      roles: ["user"],
      role: "user",
      tokenVersion: 0,
    });
    server = createApp().listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}/api/v1/discovery`;
    async function request(path, authenticated = true) {
      const result = await fetch(base + path, {
        headers: authenticated ? { Authorization: `Bearer ${token}` } : {},
      });
      return {
        status: result.status,
        body: await result.json(),
        headers: result.headers,
      };
    }
    await t.test(
      "branding is independent and full kitchen sections precede paginated items",
      async () => {
        const menu = await discoverKitchenMenu(location, osas._id.toString(), {
          page: 1,
          limit: 1,
        });
        assert.equal(menu.vendor.bannerUrl, osas.bannerUrl);
        assert.equal(menu.vendor.logoUrl, osas.logoUrl);
        assert.equal(menu.items.length, 1);
        assert.equal(menu.hasMore, true);
        assert.equal(menu.sections.length, 2);
        assert.deepEqual(
          menu.sections.map((s) => s.name),
          ["Soups & swallows", "Meals"],
        );
        const meals = menu.sections.find((s) => s.name === "Meals");
        const filtered = await discoverKitchenMenu(
          location,
          osas._id.toString(),
          { page: 1, limit: 1, section: meals.id },
        );
        assert.equal(filtered.items[0].name, "Party jollof & chicken");
        assert.equal(filtered.items[0].sectionId, meals.id);
        const foreign = rice.menuSections[0]._id.toString();
        assert.equal(
          (await request(`/kitchens/${osas._id}/menu?section=${foreign}`))
            .status,
          404,
        );
      },
    );
    await t.test(
      "legacy small chops remain readable under Bakery & snacks without rewriting data",
      async () => {
        assert.equal(
          foodCategories.some((c) => c.id === "small-chops"),
          false,
        );
        assert.equal(
          foodCategories.find((c) => c.id === "bakery-snacks").name,
          "Bakery & snacks",
        );
        const legacy = await MenuItemModel.create({
          vendorId: osas._id,
          name: "Legacy puff-puff",
          category: "small-chops",
          price: 100000,
          isPublished: true,
        });
        const meals = await discoverMeals(location, {
          ...query,
          category: "bakery-snacks",
        });
        assert.ok(meals.items.some((i) => i.menuItemId === legacy.id));
        assert.ok(meals.items.every((i) => i.category === "bakery-snacks"));
        assert.equal(
          (await MenuItemModel.findById(legacy._id)).category,
          "small-chops",
        );
        const menu = await discoverKitchenMenu(location, osas._id.toString(), {
          page: 1,
          limit: 50,
        });
        assert.equal(menu.sections.find((s) => s.id === "other").count, 1);
        const other = await discoverKitchenMenu(location, osas._id.toString(), {
          page: 1,
          limit: 1,
          section: "other",
        });
        assert.equal(other.items[0].menuItemId, legacy.id);
      },
    );
    await t.test(
      "meal results and category counts use the entire eligible area, not loaded kitchen cards",
      async () => {
        const meals = await discoverMeals(location, query);
        const kitchens = await discoverKitchens(location, query);
        assert.ok(meals.items.length > 6);
        const ids = new Set(kitchens.items.map((k) => k.vendorId));
        assert.ok(meals.items.every((item) => ids.has(item.vendorId)));
        assert.equal(
          meals.items.some((item) => item.kitchen.address.city === "Ikeja"),
          false,
        );
        assert.equal(
          meals.items.some(
            (item) => item.kitchen.businessName === "Pending Kitchen",
          ),
          false,
        );
        assert.equal(
          meals.items.some(
            (item) =>
              item.kitchen.businessName === "Night Bowl" && item.canOrder,
          ),
          false,
        );
        const filtered = await discoverMeals(location, {
          ...query,
          q: "puff-puff",
        });
        assert.ok(
          filtered.items.some((item) => item.name === "Legacy puff-puff"),
        );
        assert.equal(
          (await discoverMeals(location, { ...query, q: "[" })).items.length,
          0,
        );
        const feed = await discoveryFeed(location);
        assert.ok(feed.meals.length >= 6);
        assert.equal(
          new Set(feed.meals.map((item) => item.menuItemId)).size,
          feed.meals.length,
        );
        assert.ok(
          new Set(feed.meals.slice(0, 3).map((item) => item.vendorId)).size >=
            2,
        );
        assert.ok(
          feed.meals.every(
            (item) => item.isAvailable && item.kitchen.isAcceptingOrders,
          ),
        );
        assert.ok(feed.categories.some((c) => c.id === "bakery-snacks"));
        assert.equal(
          feed.categories.some((c) => c.id === "small-chops"),
          false,
        );
        for (const item of feed.meals) {
          assert.equal(item.kitchen.ownerId, undefined);
          assert.equal(item.kitchen.address.point, undefined);
          assert.equal(item.kitchen.businessPhone, undefined);
        }
      },
    );
    await t.test(
      "required unavailable choices cannot be advertised as available",
      async () => {
        const item = await MenuItemModel.create({
          vendorId: osas._id,
          name: "Unavailable required choice",
          category: "rice",
          price: 100000,
          isPublished: true,
          options: [
            {
              name: "Protein",
              minSelections: 1,
              maxSelections: 1,
              choices: [{ name: "Chicken", price: 0, isAvailable: false }],
            },
          ],
        });
        const results = await discoverMeals(location, {
          ...query,
          q: item.name,
        });
        assert.equal(results.items[0].isAvailable, false);
        assert.equal(results.items[0].canOrder, false);
        const feed = await discoveryFeed(location);
        assert.equal(
          feed.meals.some((meal) => meal.menuItemId === item.id),
          false,
        );
      },
    );
    await t.test(
      "city-only and missing locations make no delivery promise",
      async () => {
        const city = { country: "Nigeria", state: "Edo", city: "Benin City" };
        const meals = await discoverMeals(city, query);
        assert.equal(meals.mode, "city");
        assert.ok(
          meals.items.every(
            (item) => item.kitchen.distanceMeters === null && !item.canOrder,
          ),
        );
        assert.deepEqual((await discoveryFeed(undefined)).meals, []);
        assert.ok(
          (
            await discoverMeals(
              {
                ...location,
                point: { type: "Point", coordinates: [7.5, 9.1] },
              },
              query,
            )
          ).items.every((item) => item.kitchen.address.city === "Abuja"),
        );
        assert.equal(
          (
            await discoverMeals(
              { ...location, point: { type: "Point", coordinates: [7, 8] } },
              query,
            )
          ).items.length,
          0,
        );
      },
    );
    await t.test(
      "meal deep links enforce location, kitchen ownership and authenticated privacy",
      async () => {
        const meal = await MenuItemModel.findOne({
          vendorId: osas._id,
          isPublished: true,
        });
        for (const path of [
          "/feed",
          "/meals",
          `/kitchens/${osas._id}/meals/${meal._id}`,
        ])
          assert.equal((await request(path, false)).status, 401);
        const good = await request(`/kitchens/${osas._id}/meals/${meal._id}`);
        assert.equal(good.status, 200);
        assert.match(good.headers.get("cache-control"), /no-store/);
        assert.equal(
          (await request(`/kitchens/${rice._id}/meals/${meal._id}`)).status,
          404,
        );
        assert.equal((await request("/meals?latitude=6.3")).status, 400);
        assert.equal((await request("/feed?q=rice")).status, 400);
        assert.equal(
          (await request(`/kitchens/${osas._id}/menu?section=invalid`)).status,
          400,
        );
        await UserModel.updateOne(
          { _id: customer._id },
          {
            $set: {
              "location.point": { type: "Point", coordinates: [7.5, 9.1] },
            },
          },
        );
        assert.equal(
          (await request(`/kitchens/${osas._id}/meals/${meal._id}`)).status,
          404,
        );
      },
    );
  },
);
