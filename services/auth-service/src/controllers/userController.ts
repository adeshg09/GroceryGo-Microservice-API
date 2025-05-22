import { Request, Response } from "express";
import {
  createUserProfile,
  getUserProfile,
  suggestUsernames,
} from "../services/user";
import {
  ERROR_MESSAGES,
  GENERIC_MESSAGES,
  RESPONSE_MESSAGES,
  STATUS_CODES,
} from "../config/constants";
import { successResponse, errorResponse } from "../utils/response";
import { sanitizeProfile, sanitizeUserAndProfile } from "../utils";

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const profile = await createUserProfile(userId, req.body);
    const safeProfile = sanitizeProfile(profile);

    return successResponse(
      res,
      STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.PROFILE_CREATED,
      { profile: safeProfile }
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

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const profile = await getUserProfile(userId);
    const safeProfile = sanitizeUserAndProfile(profile);

    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.PROFILE_FETCHED,
      { userProfile: safeProfile }
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

export const getUsernameSuggestions = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName } = req.query;

    const suggestions = await suggestUsernames(
      firstName as string,
      lastName as string
    );

    return successResponse(
      res,
      STATUS_CODES.OK,
      RESPONSE_MESSAGES.SUCCESS,
      GENERIC_MESSAGES.USERNAME_SUGGESTIONS,
      suggestions
    );
  } catch (error: any) {
    const statusCode =
      error.message === ERROR_MESSAGES.REQUIRED_FIELDS
        ? STATUS_CODES.BAD_REQUEST
        : STATUS_CODES.SERVER_ERROR;

    return errorResponse(
      res,
      statusCode,
      RESPONSE_MESSAGES.BAD_REQUEST,
      error.message || ERROR_MESSAGES.USERNAME_GENERATION_FAILED,
      error
    );
  }
};
