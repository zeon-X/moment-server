import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPaginationParams } from "../../utils/pagination.js";
import * as notificationService from "./notification.service.js";

export const getUserNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);

  const notifications = await notificationService.getNotifications(req.user.id, {
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    data: notifications.items,
    pagination: notifications.pagination,
  });
});

export const readNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(
    req.params.id,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    unreadCount: result.unreadCount,
  });
});

export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});
