import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { getProfile } from "./user.controller.js";

const router = express.Router();

router.get("/:username", protect, getProfile);

export default router;
