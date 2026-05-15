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

  router.post("/:chatId/pause", (request, response) => {
    const { chatId } = request.params;
    if (!chatId) {
      return response.status(400).json({ success: false, message: "Chat ID required" });
    }
    
    store.toggleChatPause(chatId, true);
    
    response.json({
      success: true,
      message: "AI paused for this chat",
      snapshot: store.getSnapshot()
    });
  });

  router.post("/:chatId/resume", (request, response) => {
    const { chatId } = request.params;
    if (!chatId) {
      return response.status(400).json({ success: false, message: "Chat ID required" });
    }
    
    store.toggleChatPause(chatId, false);
    
    response.json({
      success: true,
      message: "AI resumed for this chat",
      snapshot: store.getSnapshot()
    });
  });

  return router;
}

module.exports = {
  createChatRoutes
};
