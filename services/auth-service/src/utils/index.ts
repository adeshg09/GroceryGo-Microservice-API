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
