import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  checkUsername,
  getMe,
  login,
  saveToken,
  signup,
} from "./auth.controller.js";
import {
  checkUsernameSchema,
  loginSchema,
  signupSchema,
} from "./auth.schema.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/fcm-token", protect, saveToken);
router.get("/me", protect, getMe);
router.get("/check-username", validate(checkUsernameSchema), checkUsername);

export default router;
