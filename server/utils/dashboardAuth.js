function getDashboardToken() {
  return String(process.env.DASHBOARD_API_TOKEN || "").trim();
}

function getRequestToken(request) {
  const authHeader = String(request.headers.authorization || "");

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return String(request.headers["x-dashboard-token"] || "").trim();
}

function requireDashboardAuth(request, response, next) {
  const expectedToken = getDashboardToken();

  if (!expectedToken) {
    next();
    return;
  }

  if (getRequestToken(request) !== expectedToken) {
    response.status(401).json({
      success: false,
      message: "Unauthorized dashboard request"
    });
    return;
  }

  next();
}

function validateSocketAuth(socket, next) {
  const expectedToken = getDashboardToken();

  if (!expectedToken) {
    next();
    return;
  }

  const authToken = String(socket.handshake.auth?.token || "").trim();
  const headerToken = String(socket.handshake.headers["x-dashboard-token"] || "").trim();

  if (authToken === expectedToken || headerToken === expectedToken) {
    next();
    return;
  }

  next(new Error("Unauthorized dashboard socket"));
}

module.exports = {
  requireDashboardAuth,
  validateSocketAuth
};
