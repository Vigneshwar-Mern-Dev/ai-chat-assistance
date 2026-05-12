const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  deleteReplyScript,
  loadReplyScripts,
  upsertReplyScript
} = require("../services/replyScriptService");

function createReplyScriptRoutes() {
  const router = express.Router();

  router.get("/", asyncHandler(async (request, response) => {
    const scripts = await loadReplyScripts();

    response.json({
      success: true,
      scripts
    });
  }));

  router.put("/:intent", asyncHandler(async (request, response) => {
    const savedScript = await upsertReplyScript(request.params.intent, request.body || {});
    const scripts = await loadReplyScripts();

    response.json({
      success: true,
      savedScript,
      scripts
    });
  }));

  router.delete("/:intent", asyncHandler(async (request, response) => {
    const deletedIntent = await deleteReplyScript(request.params.intent);
    const scripts = await loadReplyScripts();

    response.json({
      success: true,
      deletedIntent,
      scripts
    });
  }));

  return router;
}

module.exports = {
  createReplyScriptRoutes
};
