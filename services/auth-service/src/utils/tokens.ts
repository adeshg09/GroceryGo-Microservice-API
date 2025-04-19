import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { IUser } from "../models/User";
import { TOKEN_EXPIRY } from "../config/constants";
import { TokenPayload } from "../dtos/AuthDTO";

// Function to generate tokens
export const generateTokens = (
  user: IUser,
  rememberMe?: boolean
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: TOKEN_EXPIRY.ACCESS } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: rememberMe ? TOKEN_EXPIRY.REMEMBER_ME : TOKEN_EXPIRY.REFRESH,
    } as SignOptions
  );

  return { accessToken, refreshToken };
};

// Function to verify the token and extract payload
export const verifyToken = (
  token: string,
  secret: string
): TokenPayload | null => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
