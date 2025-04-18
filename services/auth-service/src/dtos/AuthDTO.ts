import { JwtPayload } from "jsonwebtoken";
import { USER_ROLES } from "../config/constants";

export interface RegisterDTO {
  phone: string;
  password: string;
  role: USER_ROLES;
}

export interface LoginDTO {
  phone: string;
  password: string;
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: USER_ROLES;
}
