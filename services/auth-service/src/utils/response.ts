import { Response } from "express";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../config/constants";

export const successResponse = (
  res: Response,
  response_code = STATUS_CODES.OK,
  response_message = RESPONSE_MESSAGES.SUCCESS,
  message: any,
  data: any = {}
) => {
  res.status(response_code).json({
    status: {
      response_code,
      response_message,
    },
    message,
    data,
  });
  return;
};

export const errorResponse = (
  res: Response,
  response_code = STATUS_CODES.BAD_REQUEST,
  response_message = RESPONSE_MESSAGES.BAD_REQUEST,
  message: any,
  error: any
) => {
  res.status(response_code).json({
    status: {
      response_code,
      response_message,
    },
    message,
    ...(error && error),
  });
  return;
};
