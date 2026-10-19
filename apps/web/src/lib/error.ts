import { ApiError } from "./api";

/** Human-readable message for any error thrown by the API client. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError) {
    return "Could not reach the API. Is the backend running on port 3000?";
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

/** Only trust same-app redirect targets, never absolute or `//host` URLs. */
export function safeNextPath(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
