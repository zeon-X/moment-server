import { firebaseAdmin } from "../../config/firebase.js";
import { prisma } from "../../config/prisma.js";

export const createNotification = async ({
  type,
  recipientId,
  senderId,
  postId,
}) => {
  // Do not notify yourself
  if (recipientId === senderId) return;

  return prisma.notification.create({
    data: {
      type,
      recipientId,
      senderId,
      postId,
    },
  });
};

export const getNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
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

  return notifications.map((n) => ({
    id: n.id,
    type: n.type.toLowerCase(),
    user: {
      name: n.sender.name,
      username: n.sender.username,
    },
    postPreview: n.post?.content?.slice(0, 50) || "",
    timestamp: n.createdAt,
    read: n.read,
  }));
};

export const markAsRead = async (notificationId, userId) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId: userId,
    },
    data: { read: true },
  });
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: {
      recipientId: userId,
      read: false,
    },
  });
};

export const sendPushNotification = async ({ token, title, body, badge }) => {
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
    console.error("FCM error:", error.message);
  }
};
