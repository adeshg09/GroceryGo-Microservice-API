/// <reference path="../types/express/index.d.ts" />

import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { login, refreshToken, register } from "../controllers/authController";

const router = Router();

router.post("/auth/:role/register", register);
router.post("/auth/:role/login", login);
router.post("/auth/refresh-token", refreshToken);
router.get("/auth/my-profile", authenticate, (req, res) => {
  res.json(req.user);
});

export default router;
