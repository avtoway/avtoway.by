export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface ApiError {
  code: "NETWORK" | "TIMEOUT" | "SERVER" | "PARSE";
  status?: number;
  message: string;
}
