import {
  getModelForClass,
  ModelOptions,
  Prop,
  Severity,
} from "@typegoose/typegoose";
import mongoose from "mongoose";

/**
 * Base Account model using MongoDB's discriminator pattern for inheritance.
 * This pattern allows for a single collection to store multiple related models
 * while maintaining distinct schemas and validation rules for each type.
 * Child models (User, Vendor) extend this base model and are differentiated by the 'role' field,
 * enabling efficient polymorphic queries and better schema organization.
 */

type Location = {
  country: string;
  state: string;
  city: string;
  street1?: string;
  street2?: string;
  zip?: string;
};

@ModelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
    discriminatorKey: "role",
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
class Account {
  _id?: mongoose.Types.ObjectId;

  @Prop({ required: false, unique: true })
  username?: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: false })
  phoneNumber?: string;

  @Prop({ required: false })
  profilePicture?: string;

  @Prop({ type: () => Object, required: true })
  location!: Location;

  @Prop({ required: true, enum: ["user", "vendor", "admin"] })
  role!: string;

  @Prop({ required: false, default: false })
  isActive?: boolean;
}

const AccountModel = getModelForClass(Account);

export { AccountModel, Account };
