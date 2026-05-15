function getBrowserBackendUrl() {
  // Use explicit environment variable if provided
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  // Fallback: assume the backend is on the same host but port 3001
  // (Standard for local development or multi-port server setups)
  return `${window.location.protocol}//${window.location.hostname}:3001`;
}

// Dynamically determine the backend URL based on the current browser location.
// This allows the same build to work on localhost and production IPs without .env changes.
export const API_URL = getBrowserBackendUrl();
export const SOCKET_URL = API_URL;
export const DASHBOARD_API_TOKEN = process.env.NEXT_PUBLIC_DASHBOARD_API_TOKEN || "";

export async function apiRequest(path, options = {}) {
  const { timeoutMs = 12000, headers, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {})
      },
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error(`Request timed out for ${path}`);
    }

    throw error;
  }

  clearTimeout(timeout);

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed for ${path}`);
  }

  return payload;
}
