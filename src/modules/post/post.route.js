import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  commentOnPost,
  createPost,
  getFeed,
  likePost,
} from "./post.controller.js";
import { commentSchema, createPostSchema } from "./post.schema.js";

const router = express.Router();

router.get("/", protect, getFeed);
router.post("/", protect, validate(createPostSchema), createPost);
router.post("/:id/like", protect, likePost);

router.post("/:id/comment", protect, validate(commentSchema), commentOnPost);

export default router;
