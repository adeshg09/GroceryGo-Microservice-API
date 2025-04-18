import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth";
import { ERROR_MESSAGES } from "../config/constants";
import { User } from "../models/User";
import { verifyToken, generateTokens } from "../utils/tokens";
import { env } from "../config/env";

// Register
export const register = async (req: Request, res: Response) => {
  try {
    console.log("test");
    const user = await registerUser(req.body, req.params.role);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const userData = await loginUser(req.body);
    res.json(userData);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token required" });
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

    res.json(tokens);
  } catch (error: any) {
    res.status(403).json({ message: error.message });
  }
};
