import { model, Schema, Types } from "mongoose";
import { Location, locationSchema } from "./location.schema";

export interface Vendor {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  businessName: string;
  businessPhone?: string;
  address: Location;
  approvalStatus: "pending" | "approved" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<Vendor>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true, trim: true },
    businessPhone: { type: String, trim: true },
    address: { type: locationSchema, required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false },
);

export const VendorModel = model<Vendor>("Vendor", vendorSchema);
