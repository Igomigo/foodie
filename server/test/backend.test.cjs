const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { spawnSync } = require("node:child_process");
const { startTestDatabase } = require("./support/database.cjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "test-secret-used-only-in-isolated-tests";
process.env.REDIS_HOST = "127.0.0.1";
process.env.REDIS_PORT = "1";

const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { UserModel } = require("../src/domain/user.model");
const { VendorModel } = require("../src/domain/vendor.model");
const {
  vendorRepository,
} = require("../src/repositories/vendorRepository/vendorRepo");
const { migrateAccounts } = require("../src/scripts/migrateAccounts");
const { hashPassword, comparePassword } = require("../src/utils/bcrypt");

test("backend account flows", { timeout: 60000 }, async (t) => {
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
  const password = "correct-password";
  const location = { country: "Nigeria", state: "Lagos", city: "Ikeja" };

  async function request(path, { body, token, cookie, method } = {}) {
    const result = await fetch(`${base}${path}`, {
      method: method || (body === undefined ? "GET" : "POST"),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: result.status,
      body: await result.json(),
      cookie: result.headers.get("set-cookie"),
    };
  }
  function signup(email, extra = {}) {
    return request("/auth/user-signup", {
      body: { email, password, ...extra },
    });
  }
  let user, accessToken, refreshCookie;

  await t.test(
    "signup sanitizes data, assigns roles, and never exposes credentials",
    async () => {
      const result = await signup("  Buyer@Example.com ", {
        username: " buyer ",
        location: { ...location, unexpected: "drop" },
        role: "user",
        roles: ["admin"],
        isActive: false,
        passwordHash: "injected",
      });
      assert.equal(result.status, 201);
      user = result.body.data;
      assert.equal(user.email, "buyer@example.com");
      assert.equal(user.username, "buyer");
      assert.deepEqual(user.roles, ["user"]);
      assert.equal(user.isActive, true);
      assert.equal(user.location.unexpected, undefined);
      assert.equal(user.password, undefined);
      assert.equal(user.passwordHash, undefined);
      const stored = await UserModel.findById(user._id).select("+passwordHash");
      assert.equal(await comparePassword(password, stored.passwordHash), true);
      assert.equal(
        (await UserModel.findById(user._id)).passwordHash,
        undefined,
      );
    },
  );

  await t.test(
    "optional usernames, duplicates, and concurrent signup",
    async () => {
      assert.equal((await signup("second@example.com")).status, 201);
      assert.equal((await signup("third@example.com")).status, 201);
      assert.equal((await signup("BUYER@example.com")).status, 409);
      assert.equal(
        (await signup("another@example.com", { username: "buyer" })).status,
        409,
      );
      const results = await Promise.all([
        signup("race@example.com"),
        signup("race@example.com"),
      ]);
      assert.deepEqual(
        results.map((result) => result.status).sort(),
        [201, 409],
      );
      assert.equal(
        await UserModel.countDocuments({ email: "race@example.com" }),
        1,
      );
    },
  );

  await t.test("validation and malformed JSON return safe errors", async () => {
    assert.equal(
      (await request("/auth/user-signup", { method: "POST" })).status,
      400,
    );
    assert.equal((await signup("invalid")).status, 400);
    assert.equal(
      (await signup("admin@example.com", { role: "admin" })).status,
      400,
    );
    assert.equal(
      (await signup("long@example.com", { password: "é".repeat(37) })).status,
      400,
    );
    const result = await fetch(`${base}/auth/user-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{broken",
    });
    assert.equal(result.status, 400);
    assert.equal((await result.json()).message, "Invalid JSON body");
  });

  await t.test(
    "login sets an HttpOnly refresh cookie and returns safe identity data",
    async () => {
      for (const email of ["missing@example.com", "buyer@example.com"]) {
        const result = await request("/auth/login", {
          body: { email, password: "incorrect-password" },
        });
        assert.equal(result.status, 401);
        assert.equal(result.body.message, "Invalid email or password");
      }
      const result = await request("/auth/login", {
        body: { email: "BUYER@example.com", password },
      });
      assert.equal(result.status, 200);
      assert.match(result.cookie, /HttpOnly/);
      assert.match(result.cookie, /SameSite=Lax/);
      assert.equal(result.body.data.refreshToken, undefined);
      assert.equal(result.body.data.passwordHash, undefined);
      assert.equal(result.body.data.userId, user._id);
      accessToken = result.body.data.accessToken;
      refreshCookie = result.cookie.split(";")[0];
    },
  );

  await t.test("profiles require authentication and ownership", async () => {
    assert.equal((await request(`/users/${user._id}`)).status, 401);
    const result = await request(`/users/${user._id}`, { token: accessToken });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.passwordHash, undefined);
    const other = await UserModel.findOne({ email: "second@example.com" });
    assert.equal(
      (await request(`/users/${other.id}`, { token: accessToken })).status,
      403,
    );
    const staleAdminToken = jwt.sign(
      { userId: user._id, type: "access", roles: ["admin"], role: "admin" },
      process.env.JWT_SECRET_KEY,
    );
    assert.equal(
      (await request(`/users/${other.id}`, { token: staleAdminToken })).status,
      403,
    );
    assert.equal(
      (await request("/users/invalid-id", { token: accessToken })).status,
      400,
    );
  });

  await t.test(
    "customers update only their own canonical discovery location",
    async () => {
      const other = await UserModel.findOne({ email: "second@example.com" });
      const next = {
        country: "Nigeria",
        state: "Edo",
        city: "Benin City",
        lga: "Oredo",
        area: " GRA ",
        point: { type: "Point", coordinates: [5.62, 6.34] },
        accuracyMeters: 28,
      };
      assert.equal(
        (
          await request("/users/me/location", {
            method: "PATCH",
            body: { location: next },
          })
        ).status,
        401,
      );
      const result = await request("/users/me/location", {
        method: "PATCH",
        token: accessToken,
        body: { userId: other.id, location: next, roles: ["admin"] },
      });
      assert.equal(result.status, 200);
      assert.equal(result.body.data.userId, user._id);
      assert.equal(result.body.data.location.area, "GRA");
      assert.equal(result.body.data.location.stateCode, "ED");
      assert.equal(
        result.body.data.location.lgaCode,
        require("../../shared/data/nigeria-lgas.json")
          .states.find((state) => state.stateCode === "ED")
          .lgas.find((lga) => lga.name === "Oredo").id,
      );
      assert.deepEqual(
        result.body.data.location.point.coordinates,
        [5.62, 6.34],
      );
      assert.equal(result.body.data.passwordHash, undefined);
      assert.deepEqual(result.body.data.roles, ["user"]);
      assert.equal((await UserModel.findById(other.id)).location, undefined);
      const profile = await request(`/users/${user._id}`, {
        token: accessToken,
      });
      assert.deepEqual(profile.body.data.location, result.body.data.location);
      for (const invalid of [
        { ...next, lga: "Ikeja" },
        { ...next, lgaCode: "forged" },
        { ...next, area: "x".repeat(101) },
        { ...next, point: { type: "Point", coordinates: [181, 6] } },
      ]) {
        assert.equal(
          (
            await request("/users/me/location", {
              method: "PATCH",
              token: accessToken,
              body: { location: invalid },
            })
          ).status,
          400,
        );
      }
      assert.deepEqual(
        (await request(`/users/${user._id}`, { token: accessToken })).body.data
          .location,
        profile.body.data.location,
      );
      const changed = await request("/users/me/location", {
        method: "PATCH",
        token: accessToken,
        body: {
          location: {
            country: "Nigeria",
            state: "Lagos",
            city: "Ikeja",
            lga: "Ikeja",
          },
        },
      });
      assert.equal(changed.status, 200);
      assert.equal(changed.body.data.location.point, undefined);
      assert.equal(changed.body.data.location.accuracyMeters, undefined);
    },
  );

  await t.test(
    "refresh checks token purpose, expiry, signatures, and payloads",
    async () => {
      const identity = {
        userId: user._id,
        role: "user",
        roles: ["user"],
        type: "refresh",
      };
      const invalidTokens = [
        "broken",
        accessToken,
        jwt.sign(identity, "wrong-secret"),
        jwt.sign(identity, process.env.JWT_SECRET_KEY, { expiresIn: -1 }),
        jwt.sign({ ...identity, userId: {} }, process.env.JWT_SECRET_KEY),
      ];
      assert.equal(
        (await request("/auth/refresh-token", { method: "POST" })).status,
        401,
      );
      for (const token of invalidTokens) {
        assert.equal(
          (
            await request("/auth/refresh-token", {
              method: "POST",
              cookie: `refreshToken=${token}`,
            })
          ).status,
          401,
        );
      }
      const result = await request("/auth/refresh-token", {
        method: "POST",
        cookie: refreshCookie,
      });
      assert.equal(result.status, 200);
      assert.equal(result.body.accessToken, result.body.data.accessToken);
      assert.equal(
        jwt.verify(result.body.accessToken, process.env.JWT_SECRET_KEY).type,
        "access",
      );
      const token = refreshCookie.slice("refreshToken=".length);
      assert.equal(
        (await request(`/users/${user._id}`, { token })).status,
        401,
      );
    },
  );

  await t.test(
    "existing customers can register a vendor without a second identity",
    async () => {
      const result = await request("/auth/vendor-signup", {
        body: {
          email: "buyer@example.com",
          password,
          businessName: "Local Kitchen",
          location,
          approvalStatus: "approved",
          ownerId: new mongoose.Types.ObjectId().toString(),
        },
      });
      assert.equal(result.status, 201);
      assert.equal(result.body.data._id, user._id);
      assert.deepEqual(result.body.data.roles, ["user", "vendor"]);
      assert.equal(result.body.data.role, "vendor");
      const vendor = result.body.data.vendor;
      assert.equal(vendor.ownerId, user._id);
      assert.equal(vendor.approvalStatus, "pending");
      assert.equal(vendor.passwordHash, undefined);
      assert.equal(vendor.email, undefined);
      assert.equal(
        await UserModel.countDocuments({ email: "buyer@example.com" }),
        1,
      );
      const duplicate = await request("/auth/vendor-signup", {
        body: {
          email: "buyer@example.com",
          password,
          businessName: "Another Kitchen",
          location,
        },
      });
      assert.equal(duplicate.status, 409);
    },
  );

  await t.test(
    "vendor registration verifies existing credentials and creates new owners",
    async () => {
      assert.equal(
        (
          await request("/auth/vendor-signup", {
            body: {
              email: "second@example.com",
              password: "wrong-password",
              businessName: "Invalid",
              location,
            },
          })
        ).status,
        401,
      );
      const result = await request("/auth/vendor-signup", {
        body: {
          email: "owner@example.com",
          password,
          businessName: "New Kitchen",
          location,
        },
      });
      assert.equal(result.status, 201);
      assert.deepEqual(result.body.data.roles, ["user", "vendor"]);
      assert.equal(
        await VendorModel.countDocuments({ ownerId: result.body.data._id }),
        1,
      );
      const login = await request("/auth/login", {
        body: { email: "owner@example.com", password },
      });
      assert.equal(login.status, 200);
      assert.equal(login.body.data.role, "vendor");
    },
  );

  await t.test(
    "vendor persistence failure rolls back new accounts and existing roles",
    async () => {
      const original = vendorRepository.create;
      vendorRepository.create = async () => {
        throw new Error("Simulated vendor persistence failure");
      };
      try {
        for (const email of ["rollback@example.com", "third@example.com"]) {
          const result = await request("/auth/vendor-signup", {
            body: { email, password, businessName: "Rollback", location },
          });
          assert.equal(result.status, 500);
          assert.equal(result.body.message, "Internal server error");
        }
        assert.equal(
          await UserModel.countDocuments({ email: "rollback@example.com" }),
          0,
        );
        assert.deepEqual(
          (
            await UserModel.findOne({ email: "third@example.com" })
          ).roles.toObject(),
          ["user"],
        );
      } finally {
        vendorRepository.create = original;
      }
    },
  );

  await t.test(
    "authorization reads current roles and account status",
    async () => {
      const refreshed = await request("/auth/refresh-token", {
        method: "POST",
        cookie: refreshCookie,
      });
      assert.equal(
        jwt.verify(refreshed.body.accessToken, process.env.JWT_SECRET_KEY).role,
        "vendor",
      );
      await UserModel.updateOne({ _id: user._id }, { isActive: false });
      assert.equal(
        (await request(`/users/${user._id}`, { token: accessToken })).status,
        401,
      );
      assert.equal(
        (
          await request("/auth/refresh-token", {
            method: "POST",
            cookie: refreshCookie,
          })
        ).status,
        401,
      );
      assert.equal(
        (
          await request("/auth/login", {
            body: { email: "buyer@example.com", password },
          })
        ).status,
        401,
      );
      await UserModel.updateOne({ _id: user._id }, { isActive: true });
    },
  );

  await t.test(
    "logout clears the cookie and development demos stay unavailable",
    async () => {
      const result = await request("/auth/logout", { method: "POST" });
      assert.equal(result.status, 200);
      assert.match(result.cookie, /Expires=Thu, 01 Jan 1970/);
      assert.equal((await request("/get-user/user:someone")).status, 404);
      assert.equal((await request("/missing")).status, 404);
      const response = await fetch(`${base}/`, {
        headers: { Origin: "https://untrusted.example" },
      });
      assert.equal(response.status, 403);
    },
  );

  await t.test(
    "migration dry run, apply, and reruns preserve IDs, hashes, and original records",
    async () => {
      const id = new mongoose.Types.ObjectId();
      const passwordHash = await hashPassword(password);
      await mongoose.connection.db.collection("accounts").insertOne({
        _id: id,
        email: " LEGACY@example.com ",
        password: passwordHash,
        role: "vendor",
        businessName: "Legacy Kitchen",
        location,
        isActive: false,
        isApproved: true,
      });
      const dryRun = await migrateAccounts();
      assert.equal(dryRun.applied, false);
      assert.equal(dryRun.inactiveAccounts, 1);
      assert.equal(await UserModel.countDocuments({ _id: id }), 0);
      await migrateAccounts(true);
      await migrateAccounts(true);
      const migrated = await UserModel.findById(id).select("+passwordHash");
      assert.equal(migrated.email, "legacy@example.com");
      assert.equal(migrated.passwordHash, passwordHash);
      assert.equal(migrated.isActive, false);
      const vendor = await VendorModel.findById(id);
      assert.equal(vendor.ownerId.toString(), id.toString());
      assert.equal(vendor.approvalStatus, "approved");
      assert.equal(
        await mongoose.connection.db.collection("accounts").countDocuments(),
        1,
      );
    },
  );

  await t.test(
    "migration refuses normalized email collisions before writing",
    async () => {
      await mongoose.connection.db.collection("accounts").insertOne({
        _id: new mongoose.Types.ObjectId(),
        email: "legacy@example.com",
        password: await hashPassword(password),
        role: "user",
      });
      const count = await UserModel.countDocuments();
      await assert.rejects(
        migrateAccounts(true),
        /Duplicate normalized identity/,
      );
      assert.equal(await UserModel.countDocuments(), count);
    },
  );

  await t.test(
    "startup fails before listening when configuration or MongoDB is unavailable",
    () => {
      for (const configuration of [
        {
          JWT_SECRET_KEY: "",
          MONGODB_URI: database.uri,
          expected: /JWT_SECRET_KEY is not defined/,
        },
        {
          JWT_SECRET_KEY: "startup-test-secret",
          MONGODB_URI: "",
          expected: /MONGODB_URI is not defined/,
        },
        {
          JWT_SECRET_KEY: "startup-test-secret",
          MONGODB_URI: "mongodb://127.0.0.1:1/unavailable",
          expected: /ECONNREFUSED/,
        },
      ]) {
        const result = spawnSync(
          process.execPath,
          ["-r", "ts-node/register", "src/index.ts"],
          {
            cwd: require("node:path").resolve(__dirname, ".."),
            env: {
              ...process.env,
              JWT_SECRET_KEY: configuration.JWT_SECRET_KEY,
              MONGODB_URI: configuration.MONGODB_URI,
            },
            encoding: "utf8",
            timeout: 15000,
          },
        );
        assert.equal(result.status, 1, result.stderr);
        assert.match(result.stderr, configuration.expected);
        assert.doesNotMatch(result.stdout, /Server is running/);
      }
    },
  );
});
