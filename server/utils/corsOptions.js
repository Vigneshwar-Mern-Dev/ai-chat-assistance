function getAllowedOrigins() {
  return String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin) {
  // Server-to-server requests (no Origin header) are permitted from same-host callers.
  if (!origin) {
    return true;
  }

  const configuredOrigins = getAllowedOrigins();

  if (configuredOrigins.length) {
    if (configuredOrigins.includes(origin)) return true;
  }

  // Development convenience: always allow localhost and loopback IPs
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("http://[::1]:")
  ) {
    return true;
  }

  // When CORS_ORIGINS is not configured, deny all cross-origin browser requests.
  return false;
}

function createCorsOptions() {
  return {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed"));
    },
    credentials: true
  };
}

module.exports = {
  createCorsOptions,
  getAllowedOrigins,
  isAllowedOrigin
};
