import { Schema } from "mongoose";

export interface Location {
  country: string;
  state: string;
  city: string;
  countryCode?: string;
  stateCode?: string;
  cityId?: number;
  lga?: string;
  lgaCode?: string;
  area?: string;
  point?: { type: "Point"; coordinates: [number, number] };
  accuracyMeters?: number;
  street1?: string;
  street2?: string;
  zip?: string;
}

export const locationSchema = new Schema<Location>(
  {
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    countryCode: String,
    stateCode: String,
    cityId: Number,
    lga: String,
    lgaCode: String,
    area: { type: String, trim: true },
    point: {
      type: new Schema(
        {
          type: { type: String, enum: ["Point"], required: true },
          coordinates: { type: [Number], required: true },
        },
        { _id: false },
      ),
      required: false,
    },
    accuracyMeters: Number,
    street1: { type: String, trim: true },
    street2: { type: String, trim: true },
    zip: { type: String, trim: true },
  },
  { _id: false },
);
