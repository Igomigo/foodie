import { getDiscriminatorModelForClass, Prop } from "@typegoose/typegoose";
import { Account, AccountModel } from "./account.model";
import mongoose from "mongoose";

class Vendor extends Account {
  @Prop({ required: true })
  businessName!: string;

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: () => "MenuItem", // TODO: change to MenuItem
    required: false,
  })
  menuItems?: mongoose.Types.ObjectId[];

  @Prop({ required: false, default: false })
  isApproved?: boolean;
}

export const VendorModel = getDiscriminatorModelForClass(
  AccountModel,
  Vendor,
  "vendor"
);
