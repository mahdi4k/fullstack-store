/**
 * Base URL of the NestJS API.
 *
 * Override with `NEXT_PUBLIC_API_URL` in `apps/web/.env.local`.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Build a full URL for an API path, e.g. `apiUrl("/products")`. */
export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}
