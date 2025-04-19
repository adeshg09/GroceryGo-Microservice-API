// models/Profile.ts
import { Schema, model, Document } from "mongoose";
import { GENDERS } from "../config/constants";

export interface IProfile extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  gender?: "Male" | "Female" | "Other";
  dob?: Date;
  email: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  user: Schema.Types.ObjectId;
}

const profileSchema = new Schema<IProfile>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  gender: { type: String, enum: Object.values(GENDERS) },
  dob: { type: Date },
  email: { type: String, required: true, unique: true },
  location: {
    type: Object,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const Profile = model<IProfile>("Profile", profileSchema);
