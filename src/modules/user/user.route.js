import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { getCommunityMembers, getProfile } from "./user.controller.js";

const router = express.Router();

router.get("/:username", protect, getProfile);
router.get("/", protect, getCommunityMembers);

export default router;
