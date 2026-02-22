import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  readNotification,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.patch("/:id/read", protect, readNotification);
router.get("/unread-count", protect, getUnreadNotificationCount);

export default router;
