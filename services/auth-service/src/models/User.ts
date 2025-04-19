import { Schema, model, Document } from "mongoose";
import { USER_ROLES } from "../config/constants";

export interface IUser extends Document {
  phone: string;
  password: string;
  role: USER_ROLES;
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
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(USER_ROLES) },
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
  { timestamps: true, discriminatorKey: "role" }
);

// Base User model
export const User = model<IUser>("User", UserSchema);

// Customer model (extends User)
export const Customer = User.discriminator(USER_ROLES.CUSTOMER, new Schema({}));

// Delivery Partner model (extends User)
export const DeliveryPartner = User.discriminator(
  USER_ROLES.DELIVERY_PARTNER,
  new Schema({
    vehicleNumber: { type: String },
  })
);

// Admin model (extends User)
export const Admin = User.discriminator(USER_ROLES.ADMIN, new Schema({}));
