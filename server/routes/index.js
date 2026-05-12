const express = require("express");
const { createChatRoutes } = require("./chatRoutes");
const { createSessionRoutes } = require("./sessionRoutes");
const { createSettingsRoutes } = require("./settingsRoutes");

function createApiRouter({ store, whatsappService }) {
  const router = express.Router();

  router.get("/app", (request, response) => {
    response.json({
      success: true,
      snapshot: store.getSnapshot()
    });
  });

  router.use("/chats", createChatRoutes({ store }));
  router.use("/session", createSessionRoutes({ store, whatsappService }));
  router.use("/settings", createSettingsRoutes({ store }));

  return router;
}

module.exports = {
  createApiRouter
};
