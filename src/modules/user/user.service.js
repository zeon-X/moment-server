import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const getUserProfile = async (username) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      age: true,
      email: true,
      username: true,
      postCount: true,
      commentCount: true,
      likeCount: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    name: user.name,
    age: user.age,
    email: user.email,
    username: user.username,
    stats: {
      posts: user.postCount,
      comments: user.commentCount,
      likes: user.likeCount,
    },
  };
};

export const getAllUsers = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    skip,
    take: limit + 1,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  const hasMore = users.length > limit;
  const items = users.slice(0, limit).map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    age: user.age,
    posts: user._count.posts,
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
