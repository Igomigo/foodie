import { Schema } from "mongoose";

export interface OpeningHours {
  day: number;
  opensAt: string;
  closesAt: string;
}

export const openingHoursSchema = new Schema<OpeningHours>(
  {
    day: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      validate: Number.isInteger,
    },
    opensAt: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    closesAt: {
      type: String,
      required: true,
      match: /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/,
      validate: function (this: OpeningHours, value: string) {
        return value !== this.opensAt;
      },
    },
  },
  { _id: false },
);
