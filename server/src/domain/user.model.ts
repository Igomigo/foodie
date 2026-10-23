import { HydratedDocument, model, Schema, Types } from "mongoose";
import { Location, locationSchema } from "./location.schema";

export type Role = "user" | "vendor" | "admin";

export interface User {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  location?: Location;
  roles: Role[];
  isActive: boolean;
  favouriteVendors: Types.ObjectId[];
  favouriteFoods: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    passwordHash: { type: String, required: true, select: false },
    username: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    profilePicture: String,
    location: locationSchema,
    roles: {
      type: [String],
      enum: ["user", "vendor", "admin"],
      default: ["user"],
      validate: (roles: Role[]) => roles.length > 0,
    },
    isActive: { type: Boolean, default: true },
    favouriteVendors: [{ type: Schema.Types.ObjectId, ref: "Vendor" }],
    favouriteFoods: [{ type: Schema.Types.ObjectId, ref: "MenuItem" }],
  },
  { timestamps: true, versionKey: false },
);

userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: { username: { $type: "string" } },
  },
);

export type UserDocument = HydratedDocument<User>;
export const UserModel = model<User>("User", userSchema);
