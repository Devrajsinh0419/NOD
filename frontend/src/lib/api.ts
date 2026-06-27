const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Generic fetch wrapper with auth header injection
 */
let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, success: boolean = false) => {
  failedQueue.forEach((prom) => {
    if (success) {
      prom.resolve();
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

interface CustomRequestInit extends RequestInit {
  _retry?: boolean;
}

/**
 * Generic fetch wrapper with auth header injection and automatic token refresh
 */
async function apiFetch<T>(
  path: string,
  options: CustomRequestInit = {}
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
    credentials: options.credentials || "include",
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

  // Intercept 401 errors for auto token refresh, except for login/refresh requests
  if (res.status === 401 && !options._retry && path !== "/api/auth/refresh/" && path !== "/api/auth/refresh" && path !== "/api/auth/login" && path !== "/api/auth/login/") {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
            resolve(apiFetch<T>(path, { ...options, _retry: true }));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh/`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        isRefreshing = false;
        processQueue(null, true);
        return apiFetch<T>(path, { ...options, _retry: true });
      } else {
        isRefreshing = false;
        const err = new Error("Session expired");
        processQueue(err, false);
        if (typeof window !== "undefined") {
          localStorage.removeItem("nod_token");
          localStorage.removeItem("nod_user");
          window.dispatchEvent(new Event("auth-session-expired"));
        }
        throw err;
      }
    } catch (refreshErr) {
      isRefreshing = false;
      processQueue(refreshErr, false);
      throw refreshErr;
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

const PRIVATE_FOLDERS = [
  "coa_licenses",
  "client_govt_ids",
  "client_proofs",
  "client_references",
  "designer_certificates",
  "designer_govt_ids",
  "contractor_ids",
  "contractor_licenses",
  "contractor_gst",
  "contractor_proofs",
  "chat_attachments",
  "reference_files",
  "government_official_ids",
  "appointment_letters",
  "tender_",
  "govt_ids",
  "project_files",
  "bid_documents",
  "project_messages",
  "wallet_documents",
  "verification_files",
  "private_media"
];

const isPrivateFileUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return PRIVATE_FOLDERS.some(folder => lowerUrl.includes(folder.toLowerCase()));
};

const downloadSecureFile = async (filePath: string): Promise<void> => {
  const match = filePath.match(/([a-f0-9\-]{36})/i);
  if (!match) {
    throw new Error("Invalid file path format: no UUID found.");
  }
  const uuid = match[1];
  const token = typeof window !== "undefined" ? localStorage.getItem("nod_token") : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/files/${uuid}/download`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Try to get filename from Content-Disposition header
  const contentDisposition = response.headers.get("content-disposition");
  let filename = `download-${uuid}`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  } else {
    // Fallback to path extension if available
    const pathParts = filePath.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart.includes(".")) {
      filename = lastPart;
    }
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export { apiFetch, API_BASE, getMediaUrl, isPrivateFileUrl, downloadSecureFile };


