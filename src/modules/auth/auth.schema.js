import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.number().int().positive().optional(),
    email: z.string().email("Invalid email"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3, "Email or username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const checkUsernameSchema = z.object({
  query: z.object({
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers and underscores allowed",
      ),
  }),
});
