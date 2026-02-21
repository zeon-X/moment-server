import { asyncHandler } from "../../utils/asyncHandler.js";
import * as authService from "./auth.service.js";

export const signup = asyncHandler(async (req, res) => {
  const { user, token } = await authService.signupUser(req.body);

  res.status(201).json({
    success: true,
    token,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(
    req.body.identifier,
    req.body.password,
  );

  res.status(200).json({
    success: true,
    token,
    data: {
      id: user.id,
      name: user.name,
      age: user.age,
      email: user.email,
      username: user.username,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      username: user.username,
      createdAt: user.createdAt,
    },
  });
});

export const checkUsername = asyncHandler(async (req, res) => {
  const available = await authService.isUsernameAvailable(req.query.username);

  res.status(200).json({
    success: true,
    available,
  });
});
