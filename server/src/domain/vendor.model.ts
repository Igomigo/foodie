import { model, Schema, Types } from "mongoose";
import { Location, locationSchema } from "./location.schema";
import { OpeningHours, openingHoursSchema } from "./opening-hours.schema";

export interface Vendor {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  businessName: string;
  businessPhone?: string;
  description?: string;
  imageUrl?: string;
  acceptingOrders: boolean;
  openingHours: OpeningHours[];
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
    description: { type: String, trim: true, maxlength: 1000 },
    imageUrl: { type: String, trim: true, maxlength: 2000 },
    acceptingOrders: { type: Boolean, required: true, default: false },
    openingHours: {
      type: [openingHoursSchema],
      required: true,
      default: [],
      validate: (hours: OpeningHours[]) =>
        hours.length <= 7 &&
        new Set(hours.map((entry) => entry.day)).size === hours.length,
    },
    address: { type: locationSchema, required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false },
);

vendorSchema.index({
  approvalStatus: 1,
  "address.stateCode": 1,
  "address.cityId": 1,
  _id: 1,
});

export const VendorModel = model<Vendor>("Vendor", vendorSchema);
