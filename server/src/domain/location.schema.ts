import { Schema } from "mongoose";

export interface Location {
  country: string;
  state: string;
  city: string;
  street1?: string;
  street2?: string;
  zip?: string;
}

export const locationSchema = new Schema<Location>(
  {
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    street1: { type: String, trim: true },
    street2: { type: String, trim: true },
    zip: { type: String, trim: true },
  },
  { _id: false },
);
