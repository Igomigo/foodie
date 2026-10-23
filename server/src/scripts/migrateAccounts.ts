import "dotenv/config";
import mongoose, { Types } from "mongoose";
import { User, UserModel } from "../domain/user.model";
import { VendorModel } from "../domain/vendor.model";
import { Location } from "../domain/location.schema";

interface LegacyAccount {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: "user" | "vendor" | "admin";
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  location?: Location;
  isActive?: boolean;
  businessName?: string;
  isApproved?: boolean;
  favouriteVendors?: Types.ObjectId[];
  favouriteFoods?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function migrateAccounts(apply = false) {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database is not connected");
  const plan = [];
  const emails = new Set<string>();
  const usernames = new Set<string>();
  let inactiveAccounts = 0;

  // Validate every source record and collision before writing any destination data.
  for await (const account of db.collection<LegacyAccount>("accounts").find()) {
    const email = account.email?.trim().toLowerCase();
    const username = account.username?.trim() || undefined;
    if (
      !email ||
      !["user", "vendor", "admin"].includes(account.role) ||
      !/^\$2[aby]\$\d{2}\$/.test(account.password || "")
    ) {
      throw new Error(
        `Invalid legacy identity ${account._id}; resolve it before migrating`,
      );
    }
    if (emails.has(email) || (username && usernames.has(username))) {
      throw new Error(
        `Duplicate normalized identity at ${account._id}; resolve it before migrating`,
      );
    }
    emails.add(email);
    if (username) usernames.add(username);

    const roles: User["roles"] =
      account.role === "user" ? ["user"] : ["user", account.role];
    const user = new UserModel({
      _id: account._id,
      email,
      username,
      passwordHash: account.password,
      roles,
      firstName: account.firstName,
      lastName: account.lastName,
      phoneNumber: account.phoneNumber,
      profilePicture: account.profilePicture,
      location: account.role === "vendor" ? undefined : account.location,
      isActive: account.isActive ?? true,
      favouriteVendors: account.favouriteVendors,
      favouriteFoods: account.favouriteFoods,
      createdAt: account.createdAt ?? account._id.getTimestamp(),
      updatedAt:
        account.updatedAt ?? account.createdAt ?? account._id.getTimestamp(),
    });
    await user.validate();
    if (!user.isActive) inactiveAccounts++;

    const identities = [
      { _id: account._id },
      { email },
      ...(username ? [{ username }] : []),
    ];
    const existingUsers = await UserModel.find({ $or: identities }).select(
      "+passwordHash",
    );
    for (const existing of existingUsers) {
      if (
        !existing._id.equals(account._id) ||
        existing.email !== email ||
        existing.passwordHash !== account.password
      ) {
        throw new Error(
          `Destination user conflicts with legacy identity ${account._id}`,
        );
      }
    }

    const vendor =
      account.role === "vendor"
        ? new VendorModel({
            _id: account._id,
            ownerId: account._id,
            businessName: account.businessName,
            businessPhone: account.phoneNumber,
            address: account.location,
            approvalStatus: account.isApproved ? "approved" : "pending",
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
        : undefined;
    if (vendor) {
      await vendor.validate();
      const existingVendors = await VendorModel.find({
        $or: [{ _id: vendor._id }, { ownerId: vendor.ownerId }],
      });
      if (
        existingVendors.some(
          (existing) =>
            !existing._id.equals(vendor._id) ||
            !existing.ownerId.equals(vendor.ownerId),
        )
      ) {
        throw new Error(
          `Destination vendor conflicts with legacy identity ${account._id}`,
        );
      }
    }
    plan.push({ user: user.toObject(), vendor: vendor?.toObject() });
  }

  if (apply) {
    await Promise.all([
      UserModel.createCollection(),
      VendorModel.createCollection(),
    ]);
    await Promise.all([UserModel.createIndexes(), VendorModel.createIndexes()]);
    for (const { user, vendor } of plan) {
      await mongoose.connection.transaction(async (session) => {
        await UserModel.collection.updateOne(
          { _id: user._id },
          { $setOnInsert: user },
          { upsert: true, session },
        );
        if (vendor) {
          await VendorModel.collection.updateOne(
            { _id: vendor._id },
            { $setOnInsert: vendor },
            { upsert: true, session },
          );
        }
      });
    }
  }
  return {
    applied: apply,
    accounts: plan.length,
    vendors: plan.filter((entry) => entry.vendor).length,
    inactiveAccounts,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--apply"))
    throw new Error("Usage: npm run migrate:accounts -- [--apply]");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  await mongoose.connect(uri, {
    autoIndex: false,
    autoCreate: false,
    serverSelectionTimeoutMS: 5000,
  });
  console.info(await migrateAccounts(args.includes("--apply")));
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
