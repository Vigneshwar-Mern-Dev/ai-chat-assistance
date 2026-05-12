const express = require("express");

function createChatRoutes({ store }) {
  const router = express.Router();

  router.get("/", (request, response) => {
    const snapshot = store.getSnapshot();
    response.json({
      success: true,
      chats: snapshot.chats,
      recentMessages: snapshot.recentMessages
    });
  });

  return router;
}

module.exports = {
  createChatRoutes
};
