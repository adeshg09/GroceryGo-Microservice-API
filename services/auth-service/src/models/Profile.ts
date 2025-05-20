// models/Profile.ts
import { Schema, model, Document } from "mongoose";
import { GENDERS } from "../config/constants";

export interface IProfile extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  gender?: "Male" | "Female" | "Other";
  dob?: Date;
  phone: string;
  user: Schema.Types.ObjectId;
}

const profileSchema = new Schema<IProfile>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  gender: { type: String, enum: Object.values(GENDERS) },
  dob: { type: Date },
  phone: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const Profile = model<IProfile>("Profile", profileSchema);
