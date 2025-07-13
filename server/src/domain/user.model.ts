import { getDiscriminatorModelForClass, Prop } from "@typegoose/typegoose";
import { Account, AccountModel } from "./account.model";
import mongoose from "mongoose";

class User extends Account {
  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: () => Account,
    required: false,
  })
  favouriteVendors?: mongoose.Types.ObjectId[];

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: () => "MenuItem", // TODO: change to MenuItem
    required: false,
  })
  favouriteFoods?: mongoose.Types.ObjectId[];
}

const UserModel = getDiscriminatorModelForClass(AccountModel, User, "user");

export { UserModel, User };
