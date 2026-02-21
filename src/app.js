import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "./config/prisma.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./modules/auth/auth.route.js";
import postRoutes from "./modules/post/post.route.js";
import userRoutes from "./modules/user/user.route.js";

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rate Limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "DB Connected" });
  } catch {
    res.status(500).json({ status: "DB Not Connected" });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
