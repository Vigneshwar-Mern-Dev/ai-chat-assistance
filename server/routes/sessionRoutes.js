const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");

function runSessionAction(label, action, store) {
  setImmediate(() => {
    action().catch((error) => {
      console.error(`${label} failed:`, error);
      store.setLastError(error.message || `${label} failed`);
    });
  });
}

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
    runSessionAction("Manual reconnect", () => whatsappService.reconnect(), store);

    response.json({
      success: true,
      snapshot: store.getSnapshot()
    });
  }));

  router.post("/regenerate-qr", asyncHandler(async (request, response) => {
    runSessionAction("QR regeneration", () => whatsappService.regenerateQr(), store);

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
