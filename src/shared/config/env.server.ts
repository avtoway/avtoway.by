import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

export const env = {
  YOUTUBE_API_KEY: requireEnv("YOUTUBE_API_KEY"),
  YOUTUBE_CHANNEL_ID: requireEnv("YOUTUBE_CHANNEL_ID"),
} as const;
