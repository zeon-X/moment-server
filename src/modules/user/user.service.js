import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

export const getUserProfile = async (username, currentUserId) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get user's posts with relations
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: {
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
      likes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate stats
  const totalPosts = posts.length;
  const totalComments = posts.reduce(
    (sum, post) => sum + post.comments.length,
    0,
  );
  const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);

  // Format posts for frontend
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    author: user.name,
    username: user.username,
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
    name: user.name,
    age: user.age,
    email: user.email,
    username: user.username,
    stats: {
      posts: totalPosts,
      comments: totalComments,
      likes: totalLikes,
    },
    posts: formattedPosts,
  };
};
