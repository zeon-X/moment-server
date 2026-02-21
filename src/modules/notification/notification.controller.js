import { asyncHandler } from "../../utils/asyncHandler.js";
import * as notificationService from "./notification.service.js";

export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user.id);

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

export const readNotification = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
});
