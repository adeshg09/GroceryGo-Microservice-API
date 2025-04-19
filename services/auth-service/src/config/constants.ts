export enum USER_ROLES {
  CUSTOMER = "customer",
  DELIVERY_PARTNER = "deliveryPartner",
  ADMIN = "admin",
}

export enum GENDERS {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export const OTP_CONTEXT = {
  PHONE_VERIFICATION: {
    CONTEXT: "phone_verification",
    EXPIRY_TIME: 5,
    MAX_ATTEMPTS: 3,
  },
  PASSWORD_RESET: {
    CONTEXT: "password_reset",
    EXPIRY_TIME: 5,
    MAX_ATTEMPTS: 3,
  },
  getContext: (contextName: string) => {
    const contexts = [
      OTP_CONTEXT.PHONE_VERIFICATION,
      OTP_CONTEXT.PASSWORD_RESET,
    ];
    return contexts.find((ctx) => ctx.CONTEXT === contextName);
  },
};

export const TOKEN_EXPIRY = {
  ACCESS: "1d",
  REFRESH: "7d",
  REMEMBER_ME: "30d",
};

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: "All the Fields are required",
  USER_EXISTS: "User already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_INVALID: "Invalid or expired token",
  USER_NOT_FOUND: "User not found",
  PROFILE_ALREADY_EXISTS: "Profile already exists for this user",
  PROFILE_NOT_FOUND: "Profile not found",
  USERNAME_EXISTS: "Username already exists",
  EMAIL_EXISTS: "Email already exists",
  USERNAME_GENERATION_FAILED: "Could not generate available usernames",
  ACCOUNT_INACTIVE: "Please complete profile to get Logged In",
  PHONE_NOT_VERIFIED: "Phone verification required",
  OTP_INVALID: "Invalid OTP",
  OTP_EXPIRED: "OTP has expired",
  OTP_ATTEMPTS_EXCEEDED: "Maximum OTP attempts reached",
  INVALID_OTP_CONTEXT: "Invalid OTP context",
  INVALID_COUNTRYCODE_FORMAT: "Country code must start with + (e.g. +91)",
  ACCESS_TOKEN_REQUIRED: "Access token required",
  FORGOT_PASSWORD_REQUIRED_FIELDS:
    "Either (phone + countryCode) or email must be provided",
};

export const RESPONSE_MESSAGES = {
  SUCCESS: "Success!",
  BAD_REQUEST: "Bad Request!",
  UNAUTHORIZED: "Unauthorized!",
  FORBIDDEN: "Forbidden!",
  NOT_FOUND: "Not Found!",
  SERVER_ERROR: "Internal Server Error!",
};

export const GENERIC_MESSAGES = {
  REGISTER_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "User logged in successfully",
  OTP_SENT: "OTP sent successfully",
  OTP_VERIFIED: "OTP verified successfully",
  TOKEN_REFRESHED: "Access token refreshed successfully",
  LOGOUT_SUCCESS: "User logged out successfully",
  PROFILE_CREATED: "User profile created successfully",
  PROFILE_FETCHED: "User profile fetched successfully",
  USERNAME_SUGGESTIONS: "Username suggestions generated successfully",
  FORGOT_PASSWORD_USER_FOUND_SUCCESS: "forgotPassword",
  RESET_OTP_SUCCESS:
    "Password reset code sent to your registered contact method successfully",
  RESET_PASSWORD_SUCCESS:
    "Password reset successfully.You need to login for further process.",
};
