const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-it";

function getDashboardToken() {
  return String(process.env.DASHBOARD_API_TOKEN || "").trim();
}

function getRequestToken(request) {
  // 1. Check Cookies (Primary for UI)
  if (request.cookies && request.cookies.dashboard_token) {
    return request.cookies.dashboard_token;
  }

  // 2. Check Authorization Header
  const authHeader = String(request.headers.authorization || "");
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  // 3. Check Custom Header
  return String(request.headers["x-dashboard-token"] || "").trim();
}

/**
 * Compare two strings in constant time to prevent timing attacks.
 */
function timingSafeEqual(a, b) {
  if (!a || !b) return false;
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    const len = Math.max(bufA.length, bufB.length);
    const paddedA = Buffer.alloc(len);
    const paddedB = Buffer.alloc(len);
    bufA.copy(paddedA);
    bufB.copy(paddedB);
    return crypto.timingSafeEqual(paddedA, paddedB) && bufA.length === bufB.length;
  } catch {
    return false;
  }
}

function requireDashboardAuth(request, response, next) {
  const token = getRequestToken(request);
  const legacyToken = getDashboardToken();

  if (!token) {
    return response.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Check Legacy Static Token (if configured)
  if (legacyToken && timingSafeEqual(token, legacyToken)) {
    next();
    return;
  }

  // Check JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded.user;
    next();
  } catch (err) {
    response.status(401).json({ success: false, message: "Invalid session" });
  }
}

function validateSocketAuth(socket, next) {
  const token = socket.handshake.auth?.token || 
                socket.handshake.headers["x-dashboard-token"] ||
                (socket.handshake.headers.cookie ? 
                  socket.handshake.headers.cookie.split('; ').find(row => row.startsWith('dashboard_token='))?.split('=')[1] : null);

  const legacyToken = getDashboardToken();

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  if (legacyToken && timingSafeEqual(token, legacyToken)) {
    return next();
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    next(new Error("Invalid session"));
  }
}

module.exports = {
  requireDashboardAuth,
  validateSocketAuth
};
