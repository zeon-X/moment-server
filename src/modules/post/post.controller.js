import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPaginationParams } from "../../utils/pagination.js";
import * as postService from "./post.service.js";

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user.id, req.body.content);

  res.status(201).json({
    success: true,
    data: post,
  });
});

export const getFeed = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const search = (req.query.search || req.query.q || "").trim();
  const authorUsername = (req.query.authorUsername || "").trim();

  const feed = await postService.getGlobalFeed(req.user.id, {
    page,
    limit,
    search,
    authorUsername,
  });

  res.status(200).json({
    success: true,
    data: feed.items,
    pagination: feed.pagination,
  });
});

export const likePost = asyncHandler(async (req, res) => {
  const result = await postService.toggleLike(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    liked: result.liked,
    likeCount: result.likeCount,
  });
});

export const commentOnPost = asyncHandler(async (req, res) => {
  const comment = await postService.addComment(
    req.user.id,
    req.params.id,
    req.body.content,
  );

  res.status(201).json({
    success: true,
    data: comment,
  });
});
