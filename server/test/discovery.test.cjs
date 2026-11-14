const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const { startTestDatabase } = require("./support/database.cjs");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "isolated-discovery-secret";
const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { UserModel } = require("../src/domain/user.model");
const { VendorModel } = require("../src/domain/vendor.model");
const { MenuItemModel } = require("../src/domain/menu-item.model");
const { locationSchema } = require("../src/auth/auth.validation");
const { discoverKitchens } = require("../src/discovery/discovery.service");
const { vendorAvailability } = require("../src/catalogue/vendor-availability");
const { generateAccessToken } = require("../src/utils/jwt");
const benin = locationSchema.validate({
  country: "Nigeria",
  state: "Edo",
  city: "Benin City",
}).value;
const point = (longitude, latitude = 6.34) => ({
  type: "Point",
  coordinates: [longitude, latitude],
});
const destination = {
  ...benin,
  street1: "Public test landmark",
  point: point(5.62),
  pointSource: "pin",
  confirmedAt: new Date(),
};
const now = new Date("2026-11-13T11:00:00Z");
const query = { page: 1, limit: 20, openOnly: false };

test("destination-aware kitchen discovery", { timeout: 60000 }, async (t) => {
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
  const customer = await UserModel.create({
    email: "discovery-customer@example.com",
    passwordHash: "test-only",
    location: destination,
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
  async function request(path = "/kitchens", authenticated = true) {
    const result = await fetch(base + path, {
      headers: authenticated ? { Authorization: `Bearer ${token}` } : {},
    });
    return {
      status: result.status,
      body: await result.json(),
      headers: result.headers,
    };
  }
  let index = 0;
  async function kitchen(
    name,
    longitude,
    extra = {},
    ownerExtra = {},
    mealExtra = {},
  ) {
    const owner = await UserModel.create({
      email: `discovery-owner-${index++}@example.com`,
      passwordHash: "private",
      roles: ["user", "vendor"],
      ...ownerExtra,
    });
    const vendor = await VendorModel.create({
      ownerId: owner._id,
      businessName: name,
      approvalStatus: "approved",
      address: { ...benin, point: point(longitude) },
      deliveryRadiusMeters: 5000,
      acceptingOrders: true,
      openingHours: Array.from({ length: 7 }, (_, day) => ({
        day,
        opensAt: "00:00",
        closesAt: "24:00",
      })),
      ...extra,
    });
    await MenuItemModel.create({
      vendorId: vendor._id,
      name: "Party jollof",
      category: "rice",
      price: 300000,
      isPublished: true,
      ...mealExtra,
    });
    return vendor;
  }
  const closed = await kitchen("Closest closed kitchen", 5.6201, {
    openingHours: [],
  });
  const first = await kitchen("First open kitchen", 5.621);
  const second = await kitchen(
    "Second open kitchen",
    5.63,
    {},
    {},
    { name: "Oha soup", category: "soups-swallows" },
  );
  const far = await kitchen("Beyond coverage", 5.65, {
    deliveryRadiusMeters: 100,
  });
  await kitchen("No coverage configured", 5.622, {
    deliveryRadiusMeters: undefined,
  });
  const pending = await kitchen("Pending kitchen", 5.622, {
    approvalStatus: "pending",
  });
  await kitchen("Inactive owner", 5.622, {}, { isActive: false });
  await kitchen("Unpublished menu", 5.622, {}, {}, { isPublished: false });
  await kitchen("Lagos kitchen", 3.39, {
    address: {
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      point: point(3.39, 6.6),
    },
  });

  await t.test(
    "coverage and visibility apply before availability/distance paging",
    async () => {
      const result = await discoverKitchens(
        destination,
        { ...query, limit: 1 },
        now,
      );
      assert.equal(result.mode, "nearby");
      assert.equal(result.items[0].vendorId, first.id);
      assert.equal(result.hasMore, true);
      const page2 = await discoverKitchens(
        destination,
        { ...query, limit: 1, page: 2 },
        now,
      );
      assert.equal(page2.items[0].vendorId, second.id);
      const all = await discoverKitchens(destination, query, now);
      assert.deepEqual(
        all.items.map((item) => item.vendorId),
        [first.id, second.id, closed.id],
      );
      assert.ok(all.items[0].distanceMeters < all.items[1].distanceMeters);
      assert.equal(all.items[0].canDeliver, true);
      for (const item of all.items)
        for (const field of [
          "ownerId",
          "businessPhone",
          "deliveryRadiusMeters",
        ])
          assert.equal(item[field], undefined);
      assert.equal(all.items[0].address.point, undefined);
    },
  );
  await t.test(
    "category and meal/kitchen search filter real published menus",
    async () => {
      assert.deepEqual(
        (
          await discoverKitchens(destination, { ...query, q: "Oha" }, now)
        ).items.map((x) => x.vendorId),
        [second.id],
      );
      assert.deepEqual(
        (
          await discoverKitchens(
            destination,
            { ...query, q: "First open" },
            now,
          )
        ).items.map((x) => x.vendorId),
        [first.id],
      );
      assert.equal(
        (await discoverKitchens(destination, { ...query, q: ".*" }, now)).items
          .length,
        0,
      );
      assert.deepEqual(
        (
          await discoverKitchens(
            destination,
            { ...query, category: "soups-swallows" },
            now,
          )
        ).items.map((x) => x.vendorId),
        [second.id],
      );
      assert.equal(
        (
          await discoverKitchens(destination, { ...query, openOnly: true }, now)
        ).items.some((x) => x.vendorId === closed.id),
        false,
      );
    },
  );
  await t.test(
    "confirmed pins work across city labels and never fall back to distant results",
    async () => {
      const result = await discoverKitchens(
        { ...destination, city: "Unlisted neighbourhood", cityId: undefined },
        query,
        now,
      );
      assert.equal(result.mode, "nearby");
      assert.equal(result.items[0].vendorId, first.id);
      assert.equal(
        (
          await discoverKitchens(
            { ...destination, point: point(7.5, 9.1) },
            query,
            now,
          )
        ).items.length,
        0,
      );
    },
  );
  await t.test(
    "city-only browsing has no invented distance or delivery promise",
    async () => {
      const city = await discoverKitchens(benin, query, now);
      assert.equal(city.mode, "city");
      assert.ok(city.items.length > 0);
      assert.ok(
        city.items.every(
          (x) => x.distanceMeters === null && x.canDeliver === null,
        ),
      );
      assert.equal(
        (await discoverKitchens(undefined, query, now)).mode,
        "location-required",
      );
      assert.equal(
        (
          await discoverKitchens(
            { ...destination, confirmedAt: undefined },
            query,
            now,
          )
        ).mode,
        "city",
      );
    },
  );
  await t.test(
    "database ranking respects overnight opening boundaries",
    async () => {
      const overnight = await kitchen("Night kitchen", 5.622, {
        openingHours: [{ day: 5, opensAt: "22:00", closesAt: "02:00" }],
      });
      for (const time of [
        "2026-11-13T20:59:00Z",
        "2026-11-13T21:00:00Z",
        "2026-11-14T00:59:00Z",
        "2026-11-14T01:00:00Z",
      ]) {
        const at = new Date(time);
        const result = await discoverKitchens(
          destination,
          { ...query, openOnly: true },
          at,
        );
        assert.equal(
          result.items.some((x) => x.vendorId === overnight.id),
          vendorAvailability(overnight, at).isAcceptingOrders,
        );
      }
      await VendorModel.updateOne(
        { _id: overnight._id },
        { $set: { approvalStatus: "suspended" } },
      );
    },
  );
  await t.test(
    "HTTP discovery uses the server-saved destination and private responses",
    async () => {
      assert.equal((await request("/kitchens", false)).status, 401);
      const result = await request();
      assert.equal(result.status, 200);
      assert.match(result.headers.get("cache-control"), /no-store/);
      for (const query of [
        "latitude=6.34",
        "cityId=123",
        "limit=999",
        "category=unknown",
      ])
        assert.equal((await request(`/kitchens?${query}`)).status, 400);
      const menu = await request(`/kitchens/${first.id}/menu`);
      assert.equal(menu.status, 200);
      assert.equal(menu.body.data.vendor.vendorId, first.id);
      assert.equal((await request(`/kitchens/${far.id}/menu`)).status, 404);
      assert.equal((await request(`/kitchens/${pending.id}/menu`)).status, 404);
      assert.equal((await request("/kitchens/not-an-id/menu")).status, 400);
    },
  );
});
