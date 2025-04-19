import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";
import { sanitizeUser } from "../utils";
import {
  ERROR_MESSAGES,
  RESPONSE_MESSAGES,
  STATUS_CODES,
} from "../config/constants";
import { errorResponse } from "../utils/response";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return errorResponse(
      res,
      STATUS_CODES.UNAUTHORIZED,
      RESPONSE_MESSAGES.UNAUTHORIZED,
      ERROR_MESSAGES.ACCESS_TOKEN_REQUIRED,
      {}
    );
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse(
        res,
        STATUS_CODES.FORBIDDEN,
        RESPONSE_MESSAGES.FORBIDDEN,
        ERROR_MESSAGES.TOKEN_INVALID,
        {}
      );
    }

    const safeUser = await sanitizeUser(user);
    req.user = safeUser;
    next();
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS_CODES.FORBIDDEN,
      RESPONSE_MESSAGES.FORBIDDEN,
      ERROR_MESSAGES.TOKEN_INVALID,
      error.message
    );
  }
};
