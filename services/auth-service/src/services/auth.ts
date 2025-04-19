import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { User } from "../models/User";
import { ERROR_MESSAGES, OTP_CONTEXT, USER_ROLES } from "../config/constants";
import {
  forgotPasswordDto,
  LoginDTO,
  OtpDTO,
  RegisterDTO,
  resetPasswordDto,
  verifyOtpDto,
} from "../dtos/AuthDTO";
import { generateTokens } from "../utils/tokens";
import { getModelByRole } from "../utils";
import { sendSmsOtp } from "../utils/sms";
import { Error } from "mongoose";

// Register a new user
export const registerUser = async (userData: RegisterDTO) => {
  const { phone, password, role, countryCode } = userData;

  if (!phone || !countryCode || !password || !role) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  if (!countryCode.startsWith("+")) {
    throw new Error(ERROR_MESSAGES.INVALID_COUNTRYCODE_FORMAT);
  }

  const formattedPhoneNo = `${countryCode}${phone}`;

  const existingUser = await User.findOne({ phone: formattedPhoneNo });
  console.log("existinguser", existingUser);
  if (existingUser) throw new Error(ERROR_MESSAGES.USER_EXISTS);

  const hashedPassword = await bcrypt.hash(password, 10);

  const Model = getModelByRole(role as USER_ROLES);
  console.log("Model is", Model);

  const newUser = new Model({
    phone: formattedPhoneNo,
    password: hashedPassword,
    role,
    isPhoneVerified: false,
    otpAttempts: 0,
    refreshTokens: [],
  });

  await newUser.save();

  return newUser;
};

// Login user
export const loginUser = async (userData: LoginDTO) => {
  const { phone, countryCode, password, rememberMe = false } = userData;

  if (!phone || !countryCode || !password) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }
  if (!countryCode.startsWith("+")) {
    throw new Error(ERROR_MESSAGES.INVALID_COUNTRYCODE_FORMAT);
  }

  const formattedPhoneNo = `${countryCode}${phone}`;

  const user = await User.findOne({ phone: formattedPhoneNo });

  if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);

  if (!user.isActivated) {
    throw new Error(ERROR_MESSAGES.ACCOUNT_INACTIVE);
  }

  const tokens = generateTokens(user, rememberMe);
  user.refreshTokens = [...(user.refreshTokens || []), tokens.refreshToken];
  await user.save();

  return { user, tokens };
};

// Initiate Otp Verification
export const initiateOtpVerification = async (otpData: OtpDTO) => {
  const { userId, context } = otpData;

  if (!userId || !context) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  const user = await User.findById(userId);
  if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

  const otpContext = OTP_CONTEXT.getContext(context);
  if (!otpContext) throw new Error(ERROR_MESSAGES.INVALID_OTP_CONTEXT);

  const otp = randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + otpContext.EXPIRY_TIME * 60 * 1000);

  user.otpData = {
    code: otp,
    expiry: otpExpiry,
    attempts: 0,
    context: otpContext.CONTEXT,
  };

  await user.save();

  await sendSmsOtp(user.phone, otp);
  return { success: true };
};

// Confirm Otp Verification
export const confirmOtpVerification = async (verifyOtpData: verifyOtpDto) => {
  const { userId, otp, expectedContext } = verifyOtpData;

  if (!userId || !otp || !expectedContext) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  const user = await User.findById(userId);
  if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

  const otpContext = OTP_CONTEXT.getContext(expectedContext);
  if (!otpContext) throw new Error(ERROR_MESSAGES.INVALID_OTP_CONTEXT);

  // Check attempts
  if ((user.otpData.attempts || 0) >= otpContext.MAX_ATTEMPTS) {
    throw new Error(ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED);
  }

  // Validate OTP
  if (
    !user.otpData.code ||
    !user.otpData.expiry ||
    user.otpData.code !== otp ||
    new Date() > user.otpData.expiry ||
    user.otpData.context !== expectedContext
  ) {
    user.otpData.attempts = (user.otpData.attempts || 0) + 1;
    await user.save();
    throw new Error(ERROR_MESSAGES.OTP_INVALID);
  }

  // Clear OTP data after successful verification
  user.otpData = {
    code: undefined,
    expiry: undefined,
    attempts: 0,
    context:
      expectedContext === OTP_CONTEXT.PHONE_VERIFICATION.CONTEXT
        ? ""
        : expectedContext,
  };

  let tokens = null;

  // Special handling for phone verification
  if (expectedContext === OTP_CONTEXT.PHONE_VERIFICATION.CONTEXT) {
    user.isPhoneVerified = true;
    tokens = generateTokens(user);
    user.refreshTokens = [...(user.refreshTokens || []), tokens.refreshToken];
    await user.save();
    return { tokens, user }; // For phone verification
  }

  await user.save();
  return {
    user,
  };
};

export const findUserForPasswordReset = async (
  forgotPassData: forgotPasswordDto
) => {
  const { phone, countryCode, email } = forgotPassData;

  // Validate at least one identifier is provided
  if ((!phone || !countryCode) && !email) {
    throw new Error(ERROR_MESSAGES.FORGOT_PASSWORD_REQUIRED_FIELDS);
  }

  let user = null;
  let formattedPhone = "";

  // Phone lookup
  if (phone && countryCode) {
    if (!countryCode.startsWith("+")) {
      throw new Error(ERROR_MESSAGES.INVALID_COUNTRYCODE_FORMAT);
    }
    formattedPhone = `${countryCode}${phone}`;
    user = await User.findOne({ phone: formattedPhone });
  }
  // Email lookup
  else if (email) {
    user = await User.findOne({ email });
  }

  if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

  return {
    userId: user._id as string,
    contactMethod: email ? email : formattedPhone,
  };
};

export const finalizePasswordReset = async (
  resetPassData: resetPasswordDto
) => {
  const { userId, newPassword } = resetPassData;

  if (!userId || !newPassword) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  const user = await User.findById(userId);
  if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

  // Additional check to ensure OTP was verified for password reset
  if (user.otpData.context !== OTP_CONTEXT.PASSWORD_RESET.CONTEXT) {
    throw new Error("OTP verification required before password reset");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear OTP context after successful reset password
  user.otpData.context = "";

  await user.save();

  return { user };
};
