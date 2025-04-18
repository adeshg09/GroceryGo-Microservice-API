import { Schema, model, Document } from "mongoose";
import { USER_ROLES } from "../config/constants";

export interface IUser extends Document {
  email: string;
  password: string;
  phone: string;
  role: USER_ROLES;
  isActivated: boolean;
  refreshTokens?: string[];
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    isActivated: { type: Boolean, default: false },
    refreshTokens: [{ type: String }],
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
