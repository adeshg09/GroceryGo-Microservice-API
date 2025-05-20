import { Schema, model, Document } from "mongoose";
import { USER_ROLES } from "../config/constants";

export interface IUser extends Document {
  email: string;
  password: string;
  isActivated: boolean;
  refreshTokens?: string[];
  profile?: Schema.Types.ObjectId;
  isPhoneVerified: boolean;
  otpData: {
    code: String | undefined;
    expiry: Date | undefined;
    attempts: number;
    context: String;
  };
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    refreshTokens: { type: [String], default: [] },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    isPhoneVerified: { type: Boolean, default: false },
    otpData: {
      code: { type: String },
      expiry: { type: Date },
      attempts: { type: Number, default: 0 },
      context: { type: String },
    },
  },
  { timestamps: true }
);

// Base User model
export const User = model<IUser>("User", UserSchema);
