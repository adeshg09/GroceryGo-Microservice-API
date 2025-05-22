import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  initiateOtpVerification,
  confirmOtpVerification,
  finalizePasswordReset,
  findUserForPasswordReset,
} from "../services/auth";
import {
  ERROR_MESSAGES,
  GENERIC_MESSAGES,
  OTP_CONTEXT,
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
    console.log("req.body", req.body);
    const user = await registerUser(req.body, res);
    console.log("user", user);
    const safeUser = sanitizeUser(user);
    return successResponse(
      res,
      STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.REGISTER_SUCCESS,
      { user: safeUser }
    );
  } catch (error: any) {
    console.log("error", error);
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
    console.log("error", error);
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
    await initiateOtpVerification(req.body);
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
    // const { userId, otp } = req.body;
    const { tokens, user } = await confirmOtpVerification(req.body);
    const safeUser = sanitizeUser(user);
    const responseData = tokens
      ? { user: safeUser, tokens } // Phone verification
      : { user: safeUser }; // Password reset
    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.OTP_VERIFIED,
      responseData
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { userId, contactMethod } = await findUserForPasswordReset(req.body);
    if (userId && contactMethod) {
      // Auto-trigger OTP after finding user
      await initiateOtpVerification({
        userId,
        context: OTP_CONTEXT.PASSWORD_RESET.CONTEXT,
      });
    }

    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.RESET_OTP_SUCCESS,
      {
        userId,
        contactMethod,
      }
    );
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS_CODES.NOT_FOUND,
      RESPONSE_MESSAGES.NOT_FOUND,
      error.message,
      error
    );
  }
};

// Reset Password (after OTP verification)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { user } = await finalizePasswordReset(req.body);
    const safeUser = sanitizeUser(user);
    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.RESET_PASSWORD_SUCCESS,
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
