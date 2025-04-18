import bcrypt from "bcrypt";
import { Customer, DeliveryPartner, User } from "../models/User";
import { ERROR_MESSAGES, USER_ROLES } from "../config/constants";
import { LoginDTO, RegisterDTO } from "../dtos/AuthDTO";
import { generateTokens } from "../utils/tokens";
import { getModelByRole } from "../utils";

// Register a new user
export const registerUser = async (userData: RegisterDTO) => {
  const { phone, password, role } = userData;

  if (!phone || !password || !role) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) throw new Error(ERROR_MESSAGES.USER_EXISTS);

  const hashedPassword = await bcrypt.hash(password, 10);

  const Model = getModelByRole(role as USER_ROLES);

  const newUser = new Model({
    phone: phone,
    password: hashedPassword,
    role,
  });

  await newUser.save();

  return newUser;
};

// Login user
export const loginUser = async (userData: LoginDTO) => {
  const { phone, password } = userData;

  if (!phone || !password) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  const user = await User.findOne({ phone });

  if (!user) throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);

  const tokens = generateTokens(user);
  user.refreshTokens = [...(user.refreshTokens || []), tokens.refreshToken];
  await user.save();

  return { user, tokens };
};
