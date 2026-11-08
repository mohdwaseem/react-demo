// =====================================================================================
//  The ONE place that talks HTTP to the .NET API. Every other file calls these helpers.
//  Similar to a typed HttpClient wrapper in C#.
//  GUIDE: docs/guide/09-integrating-backend-apis.md
// =====================================================================================
import type { ProblemDetails } from "@/types/api";

/**
 * Base URL of the .NET API.
 * - In the browser only NEXT_PUBLIC_* variables exist (inlined at build time).
 * - On the Next.js server we prefer API_BASE_URL (read at runtime, never sent to the browser).
 */
export function getApiBaseUrl(): string {
  const isServer = typeof window === "undefined";
  const url = isServer
    ? (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL)
    : process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) throw new Error("API base URL is not configured. See frontend/.env.example");
  return url.replace(/\/+$/, "");
}

/**
 * Error thrown for any non-2xx response. Carries the parsed ProblemDetails so the UI can show
 * a friendly message (`message`) and per-field validation errors (`fieldErrors`).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly title?: string;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, problem: ProblemDetails | null, fallbackMessage: string) {
    super(problem?.detail ?? problem?.title ?? fallbackMessage);
    this.name = "ApiError";
    this.status = status;
    this.title = problem?.title;
    this.fieldErrors = normalizeFieldErrors(problem?.errors);
  }
}

/**
 * ASP.NET returns validation keys as "FirstName" or "$.firstName"; our forms use "firstName".
 * We keep only the first message per field.
 */
function normalizeFieldErrors(errors?: Record<string, string[]>): Record<string, string> {
  const result: Record<string, string> = {};
  if (!errors) return result;
  for (const [key, messages] of Object.entries(errors)) {
    const clean = key.replace(/^\$\./, "");
    const camel = clean.charAt(0).toLowerCase() + clean.slice(1);
    if (messages?.length) result[camel] = messages[0];
  }
  return result;
}

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** JWT. When present it is sent as "Authorization: Bearer <token>". */
  token?: string | null;
  /** Converted to ?key=value&... (undefined/empty values are skipped). */
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(getApiBaseUrl() + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Generic typed fetch: `apiFetch<Employee>("/api/employees/1")` returns Promise<Employee>.
 * The <T> works like a C# generic method: the caller states the expected response type.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, query, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Network failure, API not running, or blocked by CORS.
    throw new ApiError(0, null, "Cannot reach the API. Is the .NET backend running on " + getApiBaseUrl() + "?");
  }

  if (!response.ok) {
    let problem: ProblemDetails | null = null;
    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      /* body was empty or not JSON */
    }
    throw new ApiError(response.status, problem, `Request failed with status ${response.status}`);
  }

  // 204 No Content (e.g. DELETE) has no body to parse.
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
