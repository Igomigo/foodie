const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Types } = require("mongoose");
const { VendorModel } = require("../src/domain/vendor.model");
const { MenuItemModel } = require("../src/domain/menu-item.model");
const { foodCategories } = require("../src/domain/food-category");
const { vendorAvailability } = require("../src/catalogue/vendor-availability");

const vendorData = {
  ownerId: new Types.ObjectId(),
  businessName: "Test Kitchen",
  address: { country: "Nigeria", state: "Edo", city: "Benin City" },
};
const itemData = {
  vendorId: new Types.ObjectId(),
  name: "Banga and starch",
  category: "soups-swallows",
  price: 350000,
};

test("catalogue defaults require publishing and kitchen readiness", () => {
  const vendor = new VendorModel(vendorData);
  const item = new MenuItemModel(itemData);
  assert.ifError(vendor.validateSync());
  assert.ifError(item.validateSync());
  assert.equal(vendor.acceptingOrders, false);
  assert.deepEqual(vendor.openingHours.toObject(), []);
  assert.equal(item.isPublished, false);
  assert.equal(item.currency, "NGN");
  assert.deepEqual(item.options.toObject(), []);
  assert.equal(
    new Set(foodCategories.map((category) => category.id)).size,
    foodCategories.length,
  );
});

test("menu prices and choice prices must be non-negative whole kobo", () => {
  for (const price of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.ok(new MenuItemModel({ ...itemData, price }).validateSync());
    assert.ok(
      new MenuItemModel({
        ...itemData,
        options: [{ name: "Extra", choices: [{ name: "Fish", price }] }],
      }).validateSync(),
    );
  }
  for (const price of [0, 1, 350000])
    assert.ifError(new MenuItemModel({ ...itemData, price }).validateSync());
  assert.ok(
    new MenuItemModel({ ...itemData, category: "unknown" }).validateSync(),
  );
  assert.ok(new MenuItemModel({ ...itemData, currency: "USD" }).validateSync());
});

test("menu options keep stable IDs and valid selection limits", () => {
  const option = {
    name: "Protein",
    minSelections: 1,
    maxSelections: 1,
    choices: [{ name: "Beef", price: 50000 }],
  };
  const item = new MenuItemModel({ ...itemData, options: [option] });
  assert.ifError(item.validateSync());
  assert.ok(item.options[0]._id);
  assert.ok(item.options[0].choices[0]._id);
  for (const changes of [
    { choices: [] },
    { minSelections: -1 },
    { maxSelections: 0 },
    { minSelections: 2 },
    { maxSelections: 2 },
    { minSelections: 0.5 },
  ])
    assert.ok(
      new MenuItemModel({
        ...itemData,
        options: [{ ...option, ...changes }],
      }).validateSync(),
    );
});

test("opening hours reject invalid days, times, duplicate days and empty intervals", () => {
  for (const openingHours of [
    [{ day: 7, opensAt: "09:00", closesAt: "18:00" }],
    [{ day: 1.5, opensAt: "09:00", closesAt: "18:00" }],
    [{ day: 1, opensAt: "24:00", closesAt: "18:00" }],
    [{ day: 1, opensAt: "09:00", closesAt: "25:00" }],
    [{ day: 1, opensAt: "09:00", closesAt: "09:00" }],
    [
      { day: 1, opensAt: "09:00", closesAt: "18:00" },
      { day: 1, opensAt: "19:00", closesAt: "23:00" },
    ],
  ])
    assert.ok(new VendorModel({ ...vendorData, openingHours }).validateSync());
  assert.ifError(
    new VendorModel({
      ...vendorData,
      openingHours: [{ day: 1, opensAt: "00:00", closesAt: "24:00" }],
    }).validateSync(),
  );
});

test("availability follows Nigerian time with inclusive opening and exclusive closing", () => {
  const vendor = {
    approvalStatus: "approved",
    acceptingOrders: true,
    openingHours: [{ day: 1, opensAt: "09:00", closesAt: "18:00" }],
  };
  for (const [date, expected] of [
    ["2026-11-09T07:59:59Z", false],
    ["2026-11-09T08:00:00Z", true],
    ["2026-11-09T16:59:59Z", true],
    ["2026-11-09T17:00:00Z", false],
    ["2026-11-10T08:00:00Z", false],
  ])
    assert.deepEqual(vendorAvailability(vendor, new Date(date)), {
      isOpen: expected,
      isAcceptingOrders: expected,
    });
  assert.equal(
    vendorAvailability(
      { ...vendor, acceptingOrders: false },
      new Date("2026-11-09T09:00:00Z"),
    ).isAcceptingOrders,
    false,
  );
  assert.equal(
    vendorAvailability(
      { ...vendor, approvalStatus: "suspended" },
      new Date("2026-11-09T09:00:00Z"),
    ).isAcceptingOrders,
    false,
  );
  assert.equal(
    vendorAvailability({ approvalStatus: "approved" }).isAcceptingOrders,
    false,
  );
});

test("overnight opening spans the Nigerian day and week boundaries", () => {
  const vendor = {
    approvalStatus: "approved",
    acceptingOrders: true,
    openingHours: [{ day: 0, opensAt: "22:00", closesAt: "02:00" }],
  };
  for (const [date, expected] of [
    ["2026-11-08T20:59:59Z", false],
    ["2026-11-08T21:00:00Z", true],
    ["2026-11-08T23:30:00Z", true],
    ["2026-11-09T01:00:00Z", false],
    ["2026-11-09T21:00:00Z", false],
  ])
    assert.equal(vendorAvailability(vendor, new Date(date)).isOpen, expected);
  const saturday = {
    ...vendor,
    openingHours: [{ day: 6, opensAt: "22:00", closesAt: "02:00" }],
  };
  assert.equal(
    vendorAvailability(saturday, new Date("2026-11-07T23:30:00Z")).isOpen,
    true,
  );
});
