import { Schema } from "inspector";
import { USER_ROLES } from "../config/constants";

export interface IUser extends Document {
  phone: string;
  password: string;
  role: USER_ROLES;
  isActivated: boolean;
  refreshTokens?: string[];
  profile?: Schema.Types.ObjectId;
  isPhoneVerified: boolean;
  otpData: {
    code: String;
    expiry: Date;
    attempts: Number;
    context: String;
  };
}

interface IOtpData {
  code: string;
  expiry: Date;
  attempts: number;
  context: string;
}
