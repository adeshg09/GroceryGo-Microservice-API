import { USER_ROLES } from "../config/constants";
import { Customer, DeliveryPartner, Admin } from "../models/User";

export const getModelByRole = (role: USER_ROLES) => {
  switch (role) {
    case USER_ROLES.CUSTOMER:
      return Customer;
    case USER_ROLES.DELIVERY_PARTNER:
      return DeliveryPartner;
    case USER_ROLES.ADMIN:
      return Admin;
    default:
      throw new Error("Invalid role");
  }
};

export const sanitizeUser = (user: any) => {
  const {
    password,
    refreshTokens,
    phoneOtp,
    phoneOtpExpiry,
    otpAttempts,
    __v,
    ...safeUser
  } = user.toObject?.() || user;
  return safeUser;
};

export const sanitizeProfile = (profile: any) => {
  const { __v, ...safeProfile } = profile.toObject?.() || profile;
  return safeProfile;
};
