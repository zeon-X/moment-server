import { NotificationType } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPaginationMeta } from "../../utils/pagination.js";
import { enqueuePostNotification } from "../notification/notification.service.js";

export const createPost = async (userId, content) => {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        content,
        authorId: userId,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { postCount: { increment: 1 } },
    });

    return post;
  });
};

export const getGlobalFeed = async (
  currentUserId,
  { page = 1, limit = 10, search = "", authorUsername = "" } = {},
) => {
  const skip = (page - 1) * limit;
  const where = authorUsername
    ? {
        author: {
          username: authorUsername,
        },
      }
    : search
    ? {
        author: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
      }
    : undefined;

  const posts = await prisma.post.findMany({
    where,
    skip,
    take: limit + 1,
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

  const hasMore = posts.length > limit;
  const items = posts.slice(0, limit).map((post) => ({
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
    const [, updatedAuthor] = await prisma.$transaction([
      prisma.like.delete({
        where: { id: existingLike.id },
      }),
      prisma.user.update({
        where: { id: post.authorId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);

    return { liked: false, likeCount: updatedAuthor.likeCount };
  }

  const [, updatedAuthor] = await prisma.$transaction([
    prisma.like.create({
      data: { userId, postId },
    }),
    prisma.user.update({
      where: { id: post.authorId },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    }),
  ]);

  enqueuePostNotification({
    type: NotificationType.LIKE,
    recipientId: post.authorId,
    senderId: userId,
    postId,
    pushTitle: "New Like ❤️",
    pushAction: "liked",
  });

  return { liked: true, likeCount: updatedAuthor.likeCount };
};

export const addComment = async (userId, postId, content) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await prisma.$transaction(async (tx) => {
    const createdComment = await tx.comment.create({
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

    await tx.user.update({
      where: { id: post.authorId },
      data: { commentCount: { increment: 1 } },
    });

    return createdComment;
  });

  enqueuePostNotification({
    type: NotificationType.COMMENT,
    recipientId: post.authorId,
    senderId: userId,
    postId,
    pushTitle: "New Comment 💬",
    pushAction: "commented on",
  });

  return {
    id: comment.id,
    author: comment.user.name,
    username: comment.user.username,
    content: comment.content,
    createdAt: comment.createdAt,
  };
};
