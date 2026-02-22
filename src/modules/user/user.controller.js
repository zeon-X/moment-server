import { asyncHandler } from "../../utils/asyncHandler.js";
import * as userService from "./user.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(
    req.params.username,
    req.user?.id,
  );

  res.status(200).json({
    success: true,
    data: profile,
  });
});

export const getCommunityMembers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const users = await userService.getAllUsers(page, limit);

  res.status(200).json({
    success: true,
    data: users,
  });
});
