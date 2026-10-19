import { apiUrl } from "./config";
import { getStoredToken } from "./auth-store";

/** Error thrown for any non-2xx API response, with the backend message. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface ApiOptions {
  method?: Method;
  body?: unknown;
  /** Bearer token; defaults to the token stored in localStorage. */
  token?: string | null;
}

/** Extract a human-readable message from a NestJS error response. */
async function extractError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    const message = data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

/**
 * Fetch the NestJS API as JSON. Throws {@link ApiError} on any non-2xx.
 *
 * ```ts
 * const { data, meta } = await api<Paginated<Product>>("/products");
 * ```
 */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const authToken = token === undefined ? getStoredToken() : token;

  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ApiError(await extractError(res), res.status);
  }
  return (await res.json()) as T;
}

/** Serialize query params, skipping undefined/null/empty values. */
export function qs(params: object) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      if (value !== "" && value !== null) search.set(key, String(value));
    }
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}
