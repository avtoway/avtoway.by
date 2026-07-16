export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "debug", msg, ...meta }));
  },
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "info", msg, ...meta }));
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: "warn", msg, ...meta }));
  },
  error: (msg: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: "error", msg, error, ...meta }));
  },
};
