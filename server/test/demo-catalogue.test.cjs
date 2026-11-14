const { test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { startTestDatabase } = require("./support/database.cjs");
process.env.NODE_ENV = "test";
const {
  seedDemoCatalogue,
  assertLocalSeed,
} = require("../src/scripts/seedDemoCatalogue");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { UserModel } = require("../src/domain/user.model");
const { VendorModel } = require("../src/domain/vendor.model");
const { MenuItemModel } = require("../src/domain/menu-item.model");
const { discoverKitchens } = require("../src/discovery/discovery.service");

test(
  "sample catalogue is local-only, repeatable and leaves customer data alone",
  { timeout: 60000 },
  async (t) => {
    for (const uri of [
      "mongodb+srv://localhost/demo",
      "mongodb://example.com/demo",
      "mongodb://localhost,example.com/demo",
      "mongodb://localhost.evil.test/demo",
    ])
      assert.throws(() => assertLocalSeed(uri));
    assert.throws(() =>
      assertLocalSeed("mongodb://localhost/demo", "production"),
    );
    const database = await startTestDatabase();
    t.after(async () => {
      if (mongoose.connection.readyState === 1)
        await mongoose.connection.dropDatabase();
      await disconnectDatabase();
      await database.stop();
    });
    process.env.MONGODB_URI = database.uri;
    await connectDatabase();
    const customer = await UserModel.create({
      email: "seed-customer@example.com",
      passwordHash: "test-only",
      location: { country: "Nigeria", state: "Edo", city: "Benin City" },
    });
    const before = await UserModel.findById(customer._id)
      .select("+passwordHash")
      .lean();
    const plan = await seedDemoCatalogue();
    assert.equal(plan.applied, false);
    assert.equal(plan.kitchens, 9);
    assert.equal(plan.meals, 26);
    assert.equal(await UserModel.countDocuments(), 1);
    assert.equal(await VendorModel.countDocuments(), 0);
    await seedDemoCatalogue(true);
    const users = await UserModel.find()
      .select("+passwordHash")
      .sort({ _id: 1 })
      .lean();
    await seedDemoCatalogue(true);
    assert.equal(await VendorModel.countDocuments(), 9);
    assert.equal(await MenuItemModel.countDocuments(), 26);
    assert.deepEqual(
      await UserModel.find().select("+passwordHash").sort({ _id: 1 }).lean(),
      users,
    );
    assert.deepEqual(
      await UserModel.findById(customer._id).select("+passwordHash").lean(),
      before,
    );
    const location = {
      ...customer.location.toObject(),
      point: { type: "Point", coordinates: [5.62, 6.32] },
      confirmedAt: new Date(),
    };
    const result = await discoverKitchens(location, {
      page: 1,
      limit: 30,
      openOnly: false,
    });
    assert.ok(result.items.length >= 4);
    assert.ok(result.items.every((k) => k.isDemo));
    assert.equal(
      result.items.some((k) => k.businessName === "Pending Kitchen"),
      false,
    );
    assert.equal(
      result.items.some((k) => k.address.city === "Ikeja"),
      false,
    );
    process.env.NODE_ENV = "production";
    try {
      assert.equal(
        (
          await discoverKitchens(location, {
            page: 1,
            limit: 30,
            openOnly: false,
          })
        ).items.length,
        0,
      );
    } finally {
      process.env.NODE_ENV = "test";
    }
  },
);
