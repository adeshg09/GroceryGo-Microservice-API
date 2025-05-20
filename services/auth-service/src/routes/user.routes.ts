/// <reference path="../types/express/index.d.ts" />

import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  getUsernameSuggestions,
  getProfile,
  createProfile,
} from "../controllers/userController";

const router = Router();

router.post("/create-profile", authenticate, createProfile);
router.get("/suggest-usernames", getUsernameSuggestions);
router.get("/user-profile", authenticate, getProfile);
// router.get("/upload-profile-pic", authenticate,uploadMiddleware, handleProfilePicUpload);

export default router;
