import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateToken } from "../../utils/generateToken.js";
import { comparePassword, hashPassword } from "../../utils/hashPassword.js";

export const signupUser = async (data) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existingUser) {
    throw new ApiError(400, "Email or username already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  const token = generateToken(user.id);

  return { user, token };
};

export const loginUser = async (identifier, password) => {
  // console.log(identifier, password);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user.id);

  return { user, token };
};

export const isUsernameAvailable = async (username) => {
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  return !existingUser;
};
