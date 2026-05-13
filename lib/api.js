function getBrowserBackendUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  return `${window.location.protocol}//${window.location.hostname}:3001`;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || getBrowserBackendUrl();
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_URL;
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
      headers: {
        "Content-Type": "application/json",
        ...(DASHBOARD_API_TOKEN ? { "X-Dashboard-Token": DASHBOARD_API_TOKEN } : {}),
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
