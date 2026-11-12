const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const { startTestDatabase } = require("./support/database.cjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "isolated-catalogue-test-secret";
const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { UserModel } = require("../src/domain/user.model");
const { VendorModel } = require("../src/domain/vendor.model");
const { MenuItemModel } = require("../src/domain/menu-item.model");
const { foodCategories } = require("../src/domain/food-category");
const { locationSchema } = require("../src/auth/auth.validation");
const { findLocalGovernment } = require("../src/location/location.catalogue");

function location(state, city, lga) {
  const result = locationSchema.validate({
    country: "Nigeria",
    state,
    city,
    ...(lga ? { lga } : {}),
  });
  assert.ifError(result.error);
  return result.value;
}
const benin = location("Edo", "Benin City", "Oredo");
const ikeja = location("Lagos", "Ikeja", "Ikeja");

function url(path, query = {}) {
  return `${path}?${new URLSearchParams(query)}`;
}
const area = { stateCode: benin.stateCode, cityId: benin.cityId };

test("public kitchen and menu catalogue", { timeout: 60000 }, async (t) => {
  const database = await startTestDatabase();
  let server;
  t.after(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState === 1)
      await mongoose.connection.dropDatabase();
    await disconnectDatabase();
    await database.stop();
  });
  process.env.MONGODB_URI = database.uri;
  await connectDatabase();
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  async function request(path, options) {
    const result = await fetch(base + path, options);
    return { status: result.status, body: await result.json() };
  }
  async function kitchen(name, extra = {}, ownerExtra = {}) {
    const owner = await UserModel.create({
      email: `${name.toLowerCase().replace(/\W/g, "")}@example.test`,
      passwordHash: "not-a-real-password",
      roles: ["user", "vendor"],
      ...ownerExtra,
    });
    return VendorModel.create({
      ownerId: owner._id,
      businessName: name,
      approvalStatus: "approved",
      address: benin,
      acceptingOrders: true,
      openingHours: Array.from({ length: 7 }, (_, day) => ({
        day,
        opensAt: "00:00",
        closesAt: "24:00",
      })),
      ...extra,
    });
  }
  function meal(vendor, name, extra = {}) {
    return MenuItemModel.create({
      vendorId: vendor._id,
      name,
      category: "rice",
      price: 300000,
      isPublished: true,
      ...extra,
    });
  }

  // Private, unrelated and empty kitchens are created first to exercise paging after eligibility checks.
  const pending = await kitchen("Pending Kitchen", {
    approvalStatus: "pending",
  });
  const suspended = await kitchen("Suspended Kitchen", {
    approvalStatus: "suspended",
  });
  const inactive = await kitchen("Inactive Owner", {}, { isActive: false });
  const noRole = await kitchen("Removed Vendor Role", {}, { roles: ["user"] });
  const empty = await kitchen("Empty Kitchen");
  const draftOnly = await kitchen("Draft Kitchen");
  const outside = await kitchen("Lagos Kitchen", { address: ikeja });
  const main = await kitchen("GRA Kitchen", {
    businessPhone: "private-business-contact",
    address: {
      ...benin,
      area: "GRA",
      point: { type: "Point", coordinates: [5.62, 6.34] },
      accuracyMeters: 20,
    },
  });
  const paused = await kitchen("Paused Kitchen", { acceptingOrders: false });
  const closed = await kitchen("Closed Kitchen", { openingHours: [] });
  const egor = await kitchen("Egor Kitchen", {
    address: location("Edo", "Benin City", "Egor"),
  });
  const legacy = await kitchen("Legacy Kitchen", {
    address: {
      country: "Nigeria",
      state: "Edo",
      city: "Benin City",
      lga: "Oredo",
    },
  });
  const noOwner = await VendorModel.create({
    ownerId: new mongoose.Types.ObjectId(),
    businessName: "Missing Owner",
    approvalStatus: "approved",
    address: benin,
  });
  for (const vendor of [
    pending,
    suspended,
    inactive,
    noRole,
    outside,
    paused,
    closed,
    egor,
    legacy,
    noOwner,
  ])
    await meal(vendor, `${vendor.businessName} rice`);
  await meal(draftOnly, "Draft rice", { isPublished: false });
  const rice = await meal(main, "Smoky jollof", {
    description: "Party rice with dodo",
  });
  const soup = await meal(main, "Banga and starch", {
    category: "soups-swallows",
    options: [
      {
        name: "Protein",
        minSelections: 1,
        choices: [
          { name: "Beef", price: 50000 },
          { name: "Fish", price: 100000 },
        ],
      },
    ],
  });
  const soldOut = await meal(main, "Groundnut soup", {
    category: "soups-swallows",
    isAvailable: false,
  });
  const noProtein = await meal(main, "Oha and akpu", {
    category: "soups-swallows",
    options: [
      {
        name: "Protein",
        minSelections: 1,
        choices: [{ name: "Beef", price: 50000, isAvailable: false }],
      },
    ],
  });
  const optional = await meal(main, "Plain rice", {
    options: [
      {
        name: "Extra",
        minSelections: 0,
        choices: [{ name: "Dodo", price: 50000, isAvailable: false }],
      },
    ],
  });
  const draft = await meal(main, "Unpublished special", { isPublished: false });

  await t.test(
    "categories expose stable IDs and labels without requiring sign-in",
    async () => {
      const result = await request("/food-categories");
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.data, foodCategories);
    },
  );

  await t.test(
    "location browsing excludes unapproved, disabled, orphaned and unpublished kitchens",
    async () => {
      const result = await request(url("/vendors", area));
      assert.equal(result.status, 200);
      assert.deepEqual(
        result.body.data.items.map((vendor) => vendor.vendorId),
        [main, paused, closed, egor, legacy].map((vendor) => vendor.id),
      );
      assert.equal(result.body.data.items[0].isAcceptingOrders, true);
      assert.equal(result.body.data.items[1].isOpen, true);
      assert.equal(result.body.data.items[1].isAcceptingOrders, false);
      assert.equal(result.body.data.items[2].isOpen, false);
      const legacyResult = result.body.data.items.at(-1);
      assert.equal(legacyResult.address.cityId, benin.cityId);
      assert.equal(
        (await VendorModel.findById(legacy.id)).address.cityId,
        undefined,
        "reading a legacy location does not migrate it",
      );
      const lagos = await request(
        url("/vendors", { stateCode: ikeja.stateCode, cityId: ikeja.cityId }),
      );
      assert.deepEqual(
        lagos.body.data.items.map((vendor) => vendor.vendorId),
        [outside.id],
      );
    },
  );

  await t.test(
    "LGA filtering uses recorded boundaries, and category filtering uses published menu items",
    async () => {
      const local = await request(
        url("/vendors", { ...area, lgaCode: benin.lgaCode }),
      );
      assert.deepEqual(
        local.body.data.items.map((vendor) => vendor.vendorId),
        [main, paused, closed, legacy].map((vendor) => vendor.id),
      );
      const categories = await request(
        url("/vendors", { ...area, category: "soups-swallows" }),
      );
      assert.deepEqual(
        categories.body.data.items.map((vendor) => vendor.vendorId),
        [main.id],
      );
      const emptyArea = await request(
        url("/vendors", {
          stateCode: "ED",
          cityId: location("Edo", "Auchi").cityId,
        }),
      );
      assert.equal(emptyArea.status, 200);
      assert.deepEqual(emptyArea.body.data.items, []);
      assert.equal(emptyArea.body.data.hasMore, false);
    },
  );

  await t.test(
    "pagination runs after visibility filters and has a stable order",
    async () => {
      const pageOne = await request(url("/vendors", { ...area, limit: 2 }));
      const pageTwo = await request(
        url("/vendors", { ...area, limit: 2, page: 2 }),
      );
      assert.deepEqual(
        pageOne.body.data.items.map((vendor) => vendor.vendorId),
        [main.id, paused.id],
      );
      assert.deepEqual(
        pageTwo.body.data.items.map((vendor) => vendor.vendorId),
        [closed.id, egor.id],
      );
      assert.equal(pageOne.body.data.hasMore, true);
      const last = await request(
        url("/vendors", { ...area, limit: 2, page: 3 }),
      );
      assert.equal(last.body.data.hasMore, false);
      const beyond = await request(
        url("/vendors", { ...area, limit: 2, page: 4 }),
      );
      assert.deepEqual(beyond.body.data.items, []);
    },
  );

  await t.test(
    "search is case-insensitive literal text rather than a regular expression",
    async () => {
      const vendors = await request(url("/vendors", { ...area, q: "gRa" }));
      assert.deepEqual(
        vendors.body.data.items.map((vendor) => vendor.vendorId),
        [main.id],
      );
      const meals = await request(url("/menu-items", { ...area, q: "JOLLOF" }));
      assert.deepEqual(
        meals.body.data.items.map((item) => item.menuItemId),
        [rice.id],
      );
      assert.equal(meals.body.data.items[0].vendorName, main.businessName);
      assert.equal(meals.body.data.items[0].price, 300000);
      const description = await request(
        url("/menu-items", { ...area, q: "dodo" }),
      );
      assert.equal(description.body.data.items[0].menuItemId, rice.id);
      for (const path of ["/vendors", "/menu-items"]) {
        const literal = await request(url(path, { ...area, q: ".*" }));
        assert.deepEqual(literal.body.data.items, []);
      }
    },
  );

  await t.test(
    "meal discovery applies location, category, visibility and paging together",
    async () => {
      const result = await request(
        url("/menu-items", { ...area, category: "soups-swallows", limit: 2 }),
      );
      assert.equal(result.status, 200);
      assert.deepEqual(
        result.body.data.items.map((item) => item.menuItemId),
        [soup.id, soldOut.id],
      );
      assert.equal(result.body.data.hasMore, true);
      const next = await request(
        url("/menu-items", {
          ...area,
          category: "soups-swallows",
          limit: 2,
          page: 2,
        }),
      );
      assert.deepEqual(
        next.body.data.items.map((item) => item.menuItemId),
        [noProtein.id],
      );
      assert.equal(next.body.data.hasMore, false);
      const lagos = await request(
        url("/menu-items", { stateCode: "LA", cityId: ikeja.cityId }),
      );
      assert.ok(
        lagos.body.data.items.every((item) => item.vendorId === outside.id),
      );
    },
  );

  await t.test(
    "vendor menus and meal details expose prices, choices and real availability",
    async () => {
      const menu = await request(`/vendors/${main.id}/menu`);
      assert.equal(menu.status, 200);
      assert.deepEqual(
        menu.body.data.items.map((item) => item.menuItemId),
        [rice, soup, soldOut, noProtein, optional].map((item) => item.id),
      );
      assert.equal(menu.body.data.items[0].canOrder, true);
      assert.equal(menu.body.data.items[2].isAvailable, false);
      assert.equal(
        menu.body.data.items[3].isAvailable,
        false,
        "required choices must be available",
      );
      assert.equal(
        menu.body.data.items[4].canOrder,
        true,
        "sold-out optional extras do not block a meal",
      );
      const details = await request(`/menu-items/${soup.id}`);
      assert.equal(
        details.body.data.item.options[0].optionId,
        soup.options[0].id,
      );
      assert.equal(
        details.body.data.item.options[0].choices[0].choiceId,
        soup.options[0].choices[0].id,
      );
      assert.equal(details.body.data.item.options[0].choices[0].price, 50000);
      assert.equal(details.body.data.vendor.vendorId, main.id);
      const filtered = await request(
        url(`/vendors/${main.id}/menu`, {
          category: "soups-swallows",
          q: "banga",
        }),
      );
      assert.deepEqual(
        filtered.body.data.items.map((item) => item.menuItemId),
        [soup.id],
      );
      const closedMenu = await request(`/vendors/${closed.id}/menu`);
      assert.equal(closedMenu.body.data.items[0].isAvailable, true);
      assert.equal(closedMenu.body.data.items[0].canOrder, false);
      const emptyMenu = await request(`/vendors/${empty.id}/menu`);
      assert.equal(emptyMenu.status, 200);
      assert.deepEqual(emptyMenu.body.data.items, []);
    },
  );

  await t.test(
    "private fields and location coordinates are excluded from every public response",
    async () => {
      for (const path of [
        url("/vendors", area),
        `/vendors/${main.id}`,
        `/vendors/${main.id}/menu`,
        url("/menu-items", area),
        `/menu-items/${soup.id}`,
      ]) {
        const result = await request(path);
        assert.equal(result.status, 200);
        const json = JSON.stringify(result.body);
        for (const key of [
          "ownerId",
          "owner",
          "passwordHash",
          "email",
          "businessPhone",
          "approvalStatus",
          "isPublished",
          "point",
          "accuracyMeters",
        ])
          assert.ok(!json.includes(`"${key}":`), `${path} leaked ${key}`);
      }
    },
  );

  await t.test(
    "direct links cannot expose hidden kitchens, meals or removed owners",
    async () => {
      for (const vendor of [pending, suspended, inactive, noRole, noOwner]) {
        assert.equal((await request(`/vendors/${vendor.id}`)).status, 404);
        assert.equal((await request(`/vendors/${vendor.id}/menu`)).status, 404);
        const item = await MenuItemModel.findOne({ vendorId: vendor.id });
        assert.equal((await request(`/menu-items/${item.id}`)).status, 404);
      }
      assert.equal((await request(`/menu-items/${draft.id}`)).status, 404);
      assert.equal(
        (await request(`/vendors/${new mongoose.Types.ObjectId()}`)).status,
        404,
      );
      assert.equal(
        (await request(`/menu-items/${new mongoose.Types.ObjectId()}`)).status,
        404,
      );
      const orphan = await MenuItemModel.create({
        vendorId: new mongoose.Types.ObjectId(),
        name: "Orphan",
        category: "rice",
        price: 100,
        isPublished: true,
      });
      assert.equal((await request(`/menu-items/${orphan.id}`)).status, 404);
      await UserModel.updateOne({ _id: main.ownerId }, { isActive: false });
      assert.equal((await request(`/vendors/${main.id}`)).status, 404);
      assert.equal((await request(`/menu-items/${rice.id}`)).status, 404);
      await UserModel.updateOne({ _id: main.ownerId }, { isActive: true });
    },
  );

  await t.test(
    "bad IDs, invalid locations, unknown parameters and oversized queries are rejected",
    async () => {
      for (const path of [
        "/vendors/not-an-id",
        "/menu-items/not-an-id",
        "/vendors/not-an-id/menu",
      ])
        assert.equal((await request(path)).status, 400);
      const lagosLga = findLocalGovernment("LA", "Ikeja");
      for (const query of [
        {},
        { stateCode: "ED" },
        { ...area, stateCode: "XX" },
        { ...area, cityId: ikeja.cityId },
        { ...area, lgaCode: lagosLga.id },
        { ...area, category: "random" },
        { ...area, page: 0 },
        { ...area, page: 1001 },
        { ...area, limit: 51 },
        { ...area, limit: 1.5 },
        { ...area, q: "a".repeat(81) },
        { ...area, q: "   " },
        { ...area, "q[$ne]": "" },
        { ...area, ownerId: main.ownerId },
      ])
        for (const path of ["/vendors", "/menu-items"])
          assert.equal(
            (await request(url(path, query))).status,
            400,
            JSON.stringify(query),
          );
      assert.equal(
        (
          await request(
            `/vendors?stateCode=ED&cityId=${benin.cityId}&q=one&q=two`,
          )
        ).status,
        400,
      );
      assert.equal(
        (await request(`/vendors/${main.id}/menu?limit=200`)).status,
        400,
      );
      assert.equal(
        (await request(`/vendors/${main.id}/menu?ownerId=123`)).status,
        400,
      );
      assert.equal(
        (await request(url("/vendors", { ...area, stateCode: "ed" }))).status,
        200,
      );
    },
  );

  await t.test(
    "catalogue endpoints cannot modify kitchens or publish meals",
    async () => {
      for (const path of [
        "/vendors",
        `/vendors/${main.id}`,
        "/menu-items",
        `/menu-items/${draft.id}`,
      ]) {
        const result = await request(path, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvalStatus: "approved",
            isPublished: true,
          }),
        });
        assert.equal(result.status, 404);
      }
      assert.equal((await MenuItemModel.findById(draft.id)).isPublished, false);
    },
  );
});
