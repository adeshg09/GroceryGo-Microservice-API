/// <reference path="../types/express/index.d.ts" />

import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { login, refreshToken, register } from "../controllers/authController";

const router = Router();

router.post("/:role/register", register);
router.post("/:role/login", login);
router.post("/refresh-token", refreshToken);
router.get("/my-profile", authenticate, (req, res) => {
  res.json(req.user);
});

export default router;
