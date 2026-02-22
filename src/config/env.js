//src/config/env.js
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  NODE_ENV: z.string(),
  FIREBASE_SERVICE_ACCOUNT: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables");
  process.exit(1);
}

export const env = parsed.data;
