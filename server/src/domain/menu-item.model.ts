import { model, Schema, Types } from "mongoose";
import { foodCategoryIds } from "./food-category";

export interface MenuChoice {
  _id: Types.ObjectId;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuOption {
  _id: Types.ObjectId;
  name: string;
  minSelections: number;
  maxSelections: number;
  choices: MenuChoice[];
}

export interface MenuItem {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  price: number;
  currency: "NGN";
  isPublished: boolean;
  isAvailable: boolean;
  options: MenuOption[];
  createdAt: Date;
  updatedAt: Date;
}

// All prices are whole kobo, including the extra charge for an option.
const priceSchema = {
  type: Number,
  required: true,
  min: 0,
  validate: Number.isSafeInteger,
};

const choiceSchema = new Schema<MenuChoice>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  price: priceSchema,
  isAvailable: { type: Boolean, required: true, default: true },
});

const optionSchema = new Schema<MenuOption>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  minSelections: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isInteger,
  },
  maxSelections: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    validate: Number.isInteger,
  },
  choices: {
    type: [choiceSchema],
    required: true,
    validate: function (this: MenuOption, choices: MenuChoice[]) {
      return (
        choices.length > 0 &&
        this.minSelections <= this.maxSelections &&
        this.maxSelections <= choices.length
      );
    },
  },
});

const menuItemSchema = new Schema<MenuItem>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },
    category: { type: String, required: true, enum: foodCategoryIds },
    imageUrl: { type: String, trim: true, maxlength: 2000 },
    price: priceSchema,
    currency: { type: String, enum: ["NGN"], required: true, default: "NGN" },
    isPublished: { type: Boolean, required: true, default: false },
    isAvailable: { type: Boolean, required: true, default: true },
    options: { type: [optionSchema], required: true, default: [] },
  },
  { timestamps: true, versionKey: false },
);

menuItemSchema.index({ vendorId: 1, isPublished: 1, category: 1, _id: 1 });

export const MenuItemModel = model<MenuItem>("MenuItem", menuItemSchema);
