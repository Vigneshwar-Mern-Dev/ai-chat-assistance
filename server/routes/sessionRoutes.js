const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");

function createSessionRoutes({ store, whatsappService }) {
  const router = express.Router();

  router.get("/", (request, response) => {
    response.json({
      success: true,
      session: store.getSnapshot().session,
      status: store.getSnapshot().status
    });
  });

  router.post("/reconnect", asyncHandler(async (request, response) => {
    whatsappService.reconnect().catch((error) => {
      console.error("Manual reconnect failed:", error);
      store.setLastError(error.message || "Manual reconnect failed");
    });

    response.json({
      success: true,
      snapshot: store.getSnapshot()
    });
  }));

  router.post("/regenerate-qr", asyncHandler(async (request, response) => {
    whatsappService.regenerateQr().catch((error) => {
      console.error("QR regeneration failed:", error);
      store.setLastError(error.message || "QR regeneration failed");
    });

    response.json({
      success: true,
      snapshot: store.getSnapshot()
    });
  }));

  router.post("/logout", asyncHandler(async (request, response) => {
    await whatsappService.logout();
    response.json({
      success: true,
      snapshot: store.getSnapshot()
    });
  }));

  router.post("/reset", asyncHandler(async (request, response) => {
    await whatsappService.resetSession();
    response.json({
      success: true,
      snapshot: store.getSnapshot()
    });
  }));

  return router;
}

module.exports = {
  createSessionRoutes
};
