import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { User } from "../models/User";
import { ERROR_MESSAGES, OTP_CONTEXT, USER_ROLES } from "../config/constants";
import { LoginDTO, RegisterDTO } from "../dtos/AuthDTO";
import { generateTokens } from "../utils/tokens";
import { getModelByRole } from "../utils";
import { sendSmsOtp } from "../utils/sms";

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

  const existingUser = await User.findOne({ formattedPhoneNo });
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
  const { phone, countryCode, password, rememberMe } = userData;

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

// Initiate Phone Verification
export const initiatePhoneVerification = async ({
  userId,
  context,
}: {
  userId: string;
  context: string;
}) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

  const otp = randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
  const otpContext = OTP_CONTEXT.getContext(context);

  user.otpData.code = otp;
  user.otpData.expiry = otpExpiry;
  user.otpData.attempts = 0;
  user.otpData.context = otpContext?.CONTEXT as string;

  await user.save();

  await sendSmsOtp(user.phone, otp);
  return { success: true };
};

// Confirm Phone Verification
export const confirmPhoneVerification = async (userId: string, otp: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  const attempts = user.otpData.attempts ?? 0;
  if (attempts >= 3) {
    throw new Error("Too many attempts. Try again later");
  }

  if (
    !user.otpData.code ||
    !user.otpData.expiry ||
    user.otpData.code !== otp ||
    new Date() > user.otpData.expiry
  ) {
    user.otpData.attempts = attempts + 1;
    await user.save();
    throw new Error("Invalid or expired OTP");
  }

  user.isPhoneVerified = true;
  user.otpData.code = undefined;
  user.otpData.expiry = undefined;

  // Generate  tokens
  const tokens = generateTokens(user);

  // Initialize refreshTokens if undefined
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(tokens.refreshToken);

  await user.save();

  return {
    success: true,
    tokens,
    user,
  };
};
