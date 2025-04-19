/// <reference path="../types/express/index.d.ts" />

import { Router } from "express";
import {
  forgotPassword,
  login,
  refreshToken,
  register,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "../controllers/authController";

const router = Router();

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Unified OTP Routes for all Contexts
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Password Management Route
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
