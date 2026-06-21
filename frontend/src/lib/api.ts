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

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "API request failed");
  }

  return json as T;
}

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

export { apiFetch, API_BASE, getMediaUrl };

