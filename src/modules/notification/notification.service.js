import { NotificationType } from "@prisma/client";
import { firebaseAdmin } from "../../config/firebase.js";
import { prisma } from "../../config/prisma.js";
import { emitToUser } from "../../socket/emitter.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const formatNotification = (notification) => ({
  id: notification.id,
  type: notification.type.toLowerCase(),
  user: {
    name: notification.sender.name,
    username: notification.sender.username,
  },
  postPreview: notification.post?.content?.slice(0, 50) || "",
  timestamp: notification.createdAt,
  read: notification.read,
});

export const createNotification = async ({
  type,
  recipientId,
  senderId,
  postId,
}) => {
  // Do not notify yourself
  if (recipientId === senderId) return;

  if (type === NotificationType.LIKE && postId) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type,
        recipientId,
        senderId,
        postId,
      },
      select: { id: true },
    });

    if (existingNotification) return null;
  }

  const notification = await prisma.notification.create({
    data: {
      type,
      recipientId,
      senderId,
      postId,
    },
    include: {
      sender: {
        select: {
          name: true,
          username: true,
        },
      },
      post: {
        select: {
          content: true,
        },
      },
    },
  });

  const unreadCount = await getUnreadCount(recipientId);
  const formattedNotification = formatNotification(notification);

  emitToUser(recipientId, "notification:new", {
    notification: formattedNotification,
    unreadCount,
  });

  return formattedNotification;
};

const notificationQueue = [];
let isProcessingNotificationQueue = false;

const processNotificationQueue = async () => {
  if (isProcessingNotificationQueue) return;

  isProcessingNotificationQueue = true;

  while (notificationQueue.length > 0) {
    const job = notificationQueue.shift();

    try {
      await job();
    } catch (error) {
      console.error("Notification queue error:", error.message);
    }
  }

  isProcessingNotificationQueue = false;
};

const enqueueNotificationJob = (job) => {
  notificationQueue.push(job);
  setImmediate(processNotificationQueue);
};

export const enqueuePostNotification = ({
  type,
  recipientId,
  senderId,
  postId,
  pushTitle,
  pushAction,
}) => {
  if (recipientId === senderId) return;

  enqueueNotificationJob(async () => {
    const notification = await createNotification({
      type,
      recipientId,
      senderId,
      postId,
    });

    if (!notification) return;

    const unreadCount = await getUnreadCount(recipientId);
    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where: { id: recipientId },
        select: { fcmToken: true },
      }),
    ]);

    await sendPushNotification({
      token: recipient?.fcmToken,
      title: pushTitle,
      body: `${sender?.name || "Someone"} ${pushAction} your post`,
      badge: unreadCount,
      recipientId,
    });
  });
};

export const getNotifications = async (userId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    skip,
    take: limit + 1,
    include: {
      sender: {
        select: {
          name: true,
          username: true,
        },
      },
      post: {
        select: {
          content: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const hasMore = notifications.length > limit;
  const items = notifications.slice(0, limit).map(formatNotification);

  return {
    items,
    pagination: getPaginationMeta({
      page,
      limit,
      hasMore,
      itemCount: items.length,
    }),
  };
};

export const markAsRead = async (notificationId, userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId: userId,
    },
    data: { read: true },
  });

  if (result.count === 0) {
    throw new ApiError(404, "Notification not found");
  }

  const unreadCount = await getUnreadCount(userId);

  emitToUser(userId, "notification:read", {
    notificationId,
    unreadCount,
  });

  return {
    notificationId,
    unreadCount,
  };
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: {
      recipientId: userId,
      read: false,
    },
  });
};

export const sendPushNotification = async ({
  token,
  title,
  body,
  badge,
  recipientId,
}) => {
  if (!token) return;

  try {
    await firebaseAdmin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
      apns: {
        payload: {
          aps: {
            badge,
          },
        },
      },
      android: {
        notification: {
          notificationCount: badge,
        },
      },
    });
  } catch (error) {
    if (error.code === "messaging/registration-token-not-registered") {
      // Delete invalid token from DB
      await prisma.user.update({
        where: { id: recipientId },
        data: { fcmToken: null },
      });
    }
    console.error("FCM error:", error.message);
  }
};
