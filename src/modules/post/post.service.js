import { NotificationType } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import {
  createNotification,
  getUnreadCount,
  sendPushNotification,
} from "../notification/notification.service.js";

export const createPost = async (userId, content) => {
  return prisma.post.create({
    data: {
      content,
      authorId: userId,
    },
  });
};

export const getGlobalFeed = async (currentUserId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      likes: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    author: post.author.name,
    username: post.author.username,
    content: post.content,
    createdAt: post.createdAt,
    likes: post.likes.length,
    liked: post.likes.some((like) => like.userId === currentUserId),
    comments: post.comments.map((comment) => ({
      id: comment.id,
      author: comment.user.name,
      username: comment.user.username,
      content: comment.content,
      createdAt: comment.createdAt,
    })),
  }));
};

export const toggleLike = async (userId, postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
    return { liked: false };
  }

  await prisma.like.create({
    data: { userId, postId },
  });

  await createNotification({
    type: NotificationType.LIKE,
    recipientId: post.authorId,
    senderId: userId,
    postId,
  });

  const unreadCount = await getUnreadCount(post.authorId);

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const recipient = await prisma.user.findUnique({
    where: { id: post.authorId },
  });

  await sendPushNotification({
    token: recipient?.fcmToken,
    title: "New Like ❤️",
    body: `${sender.name} liked your post`,
    badge: unreadCount,
  });

  return { liked: true };
};

export const addComment = async (userId, postId, content) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId,
      postId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  await createNotification({
    type: NotificationType.COMMENT,
    recipientId: post.authorId,
    senderId: userId,
    postId,
  });

  const unreadCount = await getUnreadCount(post.authorId);

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const recipient = await prisma.user.findUnique({
    where: { id: post.authorId },
  });

  await sendPushNotification({
    token: recipient?.fcmToken,
    title: "New Comment 💬",
    body: `${sender.name} commented on your post`,
    badge: unreadCount,
  });

  return {
    id: comment.id,
    author: comment.user.name,
    username: comment.user.username,
    content: comment.content,
    createdAt: comment.createdAt,
  };
};
