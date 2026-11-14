import { Schema, Types } from "mongoose";
export interface MenuSection {
  _id: Types.ObjectId;
  name: string;
  position: number;
}
export const menuSectionSchema = new Schema<MenuSection>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 60,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isSafeInteger,
  },
});
