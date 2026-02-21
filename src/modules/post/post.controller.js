import { asyncHandler } from "../../utils/asyncHandler.js";
import * as postService from "./post.service.js";

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user.id, req.body.content);

  res.status(201).json({
    success: true,
    data: post,
  });
});

export const getFeed = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const posts = await postService.getGlobalFeed(req.user.id, page, limit);

  res.status(200).json({
    success: true,
    data: posts,
  });
});

export const likePost = asyncHandler(async (req, res) => {
  const result = await postService.toggleLike(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    liked: result.liked,
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
