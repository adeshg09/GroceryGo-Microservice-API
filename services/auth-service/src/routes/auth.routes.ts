/// <reference path="../types/express/index.d.ts" />

import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  login,
  refreshToken,
  register,
  sendOtp,
  verifyOtp,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
// router.post("/forgot-password", forgotPassword);
// router.post("/verify-reset-otp", verifyResetOtp);
// router.post("/reset-password", resetPassword);

export default router;
