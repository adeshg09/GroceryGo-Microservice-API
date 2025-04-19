import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  confirmPhoneVerification,
  initiatePhoneVerification,
} from "../services/auth";
import {
  ERROR_MESSAGES,
  GENERIC_MESSAGES,
  RESPONSE_MESSAGES,
  STATUS_CODES,
} from "../config/constants";
import { User } from "../models/User";
import { verifyToken, generateTokens } from "../utils/tokens";
import { env } from "../config/env";
import { successResponse, errorResponse } from "../utils/response";
import { sanitizeUser } from "../utils";

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    const safeUser = sanitizeUser(user);
    return successResponse(
      res,
      STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.REGISTER_SUCCESS,
      { user: safeUser }
    );
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS_CODES.BAD_REQUEST,
      RESPONSE_MESSAGES.BAD_REQUEST,
      error.message,
      error
    );
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { user, tokens } = await loginUser(req.body);
    const safeUser = sanitizeUser(user);
    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.LOGIN_SUCCESS,
      { user: safeUser, tokens }
    );
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS_CODES.UNAUTHORIZED,
      RESPONSE_MESSAGES.UNAUTHORIZED,
      error.message,
      error
    );
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(
      res,
      STATUS_CODES.UNAUTHORIZED,
      RESPONSE_MESSAGES.UNAUTHORIZED,
      ERROR_MESSAGES.REQUIRED_FIELDS,
      {}
    );
  }

  try {
    const decoded = verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
    if (!decoded) throw new Error(ERROR_MESSAGES.TOKEN_INVALID);

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
    }

    // Invalidate old refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const tokens = generateTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.TOKEN_REFRESHED,
      { tokens }
    );
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS_CODES.FORBIDDEN,
      RESPONSE_MESSAGES.FORBIDDEN,
      error.message,
      error
    );
  }
};

// Send OTP
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.BAD_REQUEST,
        ERROR_MESSAGES.REQUIRED_FIELDS,
        {}
      );
    }

    await initiatePhoneVerification(userId);
    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.OTP_SENT
    );
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS_CODES.BAD_REQUEST,
      RESPONSE_MESSAGES.BAD_REQUEST,
      error.message,
      error
    );
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;
    const { tokens, user } = await confirmPhoneVerification(userId, otp);
    const safeUser = sanitizeUser(user);
    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.OTP_VERIFIED,
      { user: safeUser, tokens }
    );
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS_CODES.BAD_REQUEST,
      RESPONSE_MESSAGES.BAD_REQUEST,
      error.message,
      error
    );
  }
};

// Forgot Password
// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const { phone, countryCode } = req.body;
//     if (!phone || !countryCode) {
//       return errorResponse(
//         res,
//         STATUS_CODES.BAD_REQUEST,
//         RESPONSE_MESSAGES.BAD_REQUEST,
//         "phone and countryCode is required",
//         {}
//       );
//     }

//     const formattedPhoneNo = `${countryCode}${phone}`;
//     const user = await User.findOne({ phone: formattedPhoneNo });

//     if (!user) {
//       return errorResponse(
//         res,
//         STATUS_CODES.NOT_FOUND,
//         RESPONSE_MESSAGES.NOT_FOUND,
//         ERROR_MESSAGES.USER_NOT_FOUND,
//         {}
//       );
//     }

//     await initiatePhoneVerification(user._id as string);

//     return successResponse(
//       res,
//       STATUS_CODES.OK,
//       RESPONSE_MESSAGES.SUCCESS,
//       GENERIC_MESSAGES.OTP_VERIFIED,
//       { user: safeUser, tokens }
//     );
//   } catch (error: any) {
//     return errorResponse(
//       res,
//       STATUS_CODES.BAD_REQUEST,
//       RESPONSE_MESSAGES.BAD_REQUEST,
//       error.message,
//       error
//     );
//   }
// };
