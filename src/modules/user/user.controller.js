import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPaginationParams } from "../../utils/pagination.js";
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
  const { page, limit } = getPaginationParams(req.query);

  const users = await userService.getAllUsers({ page, limit });

  res.status(200).json({
    success: true,
    data: users.items,
    pagination: users.pagination,
  });
});
