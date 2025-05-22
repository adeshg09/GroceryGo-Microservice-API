import { JwtPayload } from "jsonwebtoken";

export interface RegisterDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
  checkOnly?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TokenPayload extends JwtPayload {
  userId: string;
}

export interface OtpDTO {
  userId?: string;
  email?: string;
  phone?: string;
  context: string;
}

export interface verifyOtpDto {
  userId?: string;
  email?: string;
  phone?: string;
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
