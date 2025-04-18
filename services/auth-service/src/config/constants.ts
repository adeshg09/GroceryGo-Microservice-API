export enum USER_ROLES {
  CUSTOMER = "customer",
  DELIVERY_PARTNER = "deliveryPartner",
  ADMIN = "admin",
}

export const TOKEN_EXPIRY = {
  ACCESS: "1d",
  REFRESH: "7d",
};

export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: "All the Fields are required",
  USER_EXISTS: "User already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_INVALID: "Invalid or expired token",
};
