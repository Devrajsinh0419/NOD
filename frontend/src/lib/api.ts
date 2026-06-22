const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Generic fetch wrapper with auth header injection
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("nod_token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let json: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      json = await res.json();
    } catch (e) {
      // Ignored: parse failed despite content-type header
    }
  }

  if (!res.ok) {
    let errorMsg = json?.message;
    if (!errorMsg) {
      try {
        const text = await res.text();
        errorMsg = text || `Request failed with status ${res.status}`;
      } catch (e) {
        errorMsg = `Request failed with status ${res.status}`;
      }
    }

    // Clean up cryptic database UNIQUE constraint errors for user-friendliness
    if (typeof errorMsg === "string") {
      const lower = errorMsg.toLowerCase();
      if (lower.includes("unique constraint") || lower.includes("unique constraint failed")) {
        if (lower.includes("phone_number") || lower.includes("phone")) {
          errorMsg = "This phone number is already registered. Please use a different phone number.";
        } else if (lower.includes("email")) {
          errorMsg = "This email address is already registered. Please use a different email.";
        } else if (lower.includes("username")) {
          errorMsg = "This username is already taken. Please choose a different username.";
        }
      }
    }
    throw new Error(errorMsg);
  }

  if (json && json.success === false) {
    let errorMsg = json.message || "API request failed";
    if (typeof errorMsg === "string") {
      const lower = errorMsg.toLowerCase();
      if (lower.includes("unique constraint") || lower.includes("unique constraint failed")) {
        if (lower.includes("phone_number") || lower.includes("phone")) {
          errorMsg = "This phone number is already registered. Please use a different phone number.";
        } else if (lower.includes("email")) {
          errorMsg = "This email address is already registered. Please use a different email.";
        } else if (lower.includes("username")) {
          errorMsg = "This username is already taken. Please choose a different username.";
        }
      }
    }
    throw new Error(errorMsg);
  }

  return (json || {}) as T;
}

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

export { apiFetch, API_BASE, getMediaUrl };

