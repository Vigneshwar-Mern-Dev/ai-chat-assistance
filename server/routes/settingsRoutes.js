const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");

function createSettingsRoutes({ store }) {
  const router = express.Router();

  router.get("/", (request, response) => {
    response.json({
      success: true,
      settings: store.getSettings()
    });
  });

  router.put("/", asyncHandler(async (request, response) => {
    const settings = await store.updateSettings(request.body || {});

    response.json({
      success: true,
      settings,
      snapshot: store.getSnapshot()
    });
  }));

  return router;
}

module.exports = {
  createSettingsRoutes
};
