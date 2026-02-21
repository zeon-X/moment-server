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
