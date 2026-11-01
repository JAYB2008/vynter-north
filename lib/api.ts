import { ApiResponse } from "./types";

/**
 * Universal client-side fetch helper for Vynter North.
 * Non-negotiable rule: "No 'Failed to fetch' ever reaches the user."
 * Converts any network failure or non-OK response into a clean { ok: false, error: { code, message } }
 */
export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers || {}),
      },
    });

    // Check if the response returned JSON
    const contentType = res.headers.get("content-type") || "";
    let json: any = null;
    if (contentType.includes("application/json")) {
      try {
        json = await res.json();
      } catch {
        json = null;
      }
    }

    if (!res.ok) {
      if (json && json.error && typeof json.error.message === "string") {
        return {
          ok: false,
          error: {
            code: json.error.code || `HTTP_${res.status}`,
            message: json.error.message,
          },
        };
      }
      return {
        ok: false,
        error: {
          code: `HTTP_${res.status}`,
          message:
            res.status === 404
              ? "The requested item was not found."
              : res.status === 401
              ? "You must be signed in to perform this action."
              : res.status === 403
              ? "You do not have permission to perform this action."
              : `Server returned an error (${res.status}). Check your inputs and try again.`,
        },
      };
    }

    // Standardized response envelope check
    if (json && typeof json.ok === "boolean") {
      return json as ApiResponse<T>;
    }

    // Raw payload fallback
    return {
      ok: true,
      data: (json ?? null) as T,
    };
  } catch (err: any) {
    // Catch fetch network errors (such as "Failed to fetch")
    console.warn("apiFetch network exception handled:", err?.message || err);
    return {
      ok: false,
      error: {
        code: "NETWORK_UNAVAILABLE",
        message: "Couldn't reach Vynter North. Check your connection and try again.",
      },
    };
  }
}
