import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from "../modules/notification/notification.service.js";
import { setIO } from "./emitter.js";

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  const bearerToken = socket.handshake.headers?.authorization;
  const queryToken = socket.handshake.query?.token;

  if (authToken) return authToken;
  if (bearerToken?.startsWith("Bearer ")) return bearerToken.split(" ")[1];
  if (queryToken) return queryToken;

  return null;
};

const respond = (callback, payload) => {
  if (typeof callback === "function") {
    callback(payload);
  }
};

const getNotificationId = (payload) => {
  if (typeof payload === "string") return payload;

  return payload?.notificationId;
};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  setIO(io);

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, username: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userRoom = `user:${socket.user.id}`;
    socket.join(userRoom);

    socket.on("notifications:get", async (callback) => {
      try {
        const [notifications, unreadCount] = await Promise.all([
          getNotifications(socket.user.id),
          getUnreadCount(socket.user.id),
        ]);

        respond(callback, {
          success: true,
          data: notifications,
          unreadCount,
        });
      } catch (error) {
        respond(callback, {
          success: false,
          message: error.message || "Failed to fetch notifications",
        });
      }
    });

    socket.on("notifications:unread-count", async (callback) => {
      try {
        const unreadCount = await getUnreadCount(socket.user.id);

        respond(callback, {
          success: true,
          unreadCount,
        });
      } catch (error) {
        respond(callback, {
          success: false,
          message: error.message || "Failed to fetch unread count",
        });
      }
    });

    socket.on("notification:read", async (payload, callback) => {
      try {
        const notificationId = getNotificationId(payload);

        if (!notificationId) {
          return respond(callback, {
            success: false,
            message: "Notification id is required",
          });
        }

        const result = await markAsRead(notificationId, socket.user.id);

        respond(callback, {
          success: true,
          message: "Notification marked as read",
          notificationId: result.notificationId,
          unreadCount: result.unreadCount,
        });
      } catch (error) {
        respond(callback, {
          success: false,
          message: error.message || "Failed to mark notification as read",
        });
      }
    });
  });

  return io;
};
