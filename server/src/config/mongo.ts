import mongoose from "mongoose";
import { UserModel } from "../domain/user.model";
import { VendorModel } from "../domain/vendor.model";
import { logger } from "../utils/logger";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  mongoose.set("bufferCommands", false);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const hello = await mongoose.connection.db!.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== "isdbgrid") {
    throw new Error(
      "MongoDB must be a replica set to support atomic vendor registration",
    );
  }
  await Promise.all([UserModel.init(), VendorModel.init()]);
  logger.info("Connected to database", "MongoDB");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
