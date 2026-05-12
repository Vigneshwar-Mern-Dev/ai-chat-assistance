function getAllowedOrigins() {
  return String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const configuredOrigins = getAllowedOrigins();

  if (configuredOrigins.length) {
    return configuredOrigins.includes(origin);
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function createCorsOptions() {
  return {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed"));
    }
  };
}

module.exports = {
  createCorsOptions,
  getAllowedOrigins,
  isAllowedOrigin
};
