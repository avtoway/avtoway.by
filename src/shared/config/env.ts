import { z } from "zod";

const envSchema = z.object({
  YOUTUBE_API_KEY: z.string().min(1, "YOUTUBE_API_KEY is required"),
  YOUTUBE_CHANNEL_ID: z.string().min(1, "YOUTUBE_CHANNEL_ID is required"),
  DATABASE_URL: z.string().url().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
});

export const env = envSchema.parse(process.env);
