import { JwtPayload } from "jsonwebtoken";
import { USER_ROLES } from "../config/constants";

export interface RegisterDTO {
  phone: string;
  countryCode: string;
  password: string;
  role: USER_ROLES;
  rememberMe?: boolean;
}

export interface LoginDTO {
  phone: string;
  countryCode: string;
  password: string;
  rememberMe?: boolean;
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: USER_ROLES;
}

export interface OtpDTO {
  userId: string;
  context: string;
}

export interface verifyOtpDto {
  userId: string;
  otp: string;
  expectedContext: string;
}

export interface forgotPasswordDto {
  phone?: string;
  countryCode?: string;
  email?: string;
}

export interface resetPasswordDto {
  userId: string;
  newPassword: string;
}
