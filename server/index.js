require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { createOpenAIService } = require("./ai/openaiService");
const { createApiRouter } = require("./routes");
const { createSocketServer } = require("./socket");
const { createCorsOptions } = require("./utils/corsOptions");
const { requireDashboardAuth } = require("./utils/dashboardAuth");
const { migrateLegacyRuntimeStorage } = require("./utils/runtimeStorage");
const { createAppStore } = require("./services/store");
const { createWhatsAppService } = require("./services/whatsappService");

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const port = Number(process.env.PORT || 3001);

  await migrateLegacyRuntimeStorage();

  const store = createAppStore();
  await store.initialize();

  app.use(cors(createCorsOptions()));
  app.use(express.json());

  app.get("/health", (request, response) => {
    response.json({
      success: true,
      status: "ok"
    });
  });

  const openAIService = createOpenAIService();
  const whatsappService = createWhatsAppService({
    store,
    openAIService
  });

  app.use("/api", requireDashboardAuth, createApiRouter({ store, whatsappService }));

  app.use((error, request, response, next) => {
    console.error(error);
    response.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  });

  createSocketServer(httpServer, store);

  httpServer.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);

    whatsappService.initialize().catch((error) => {
      console.error("WhatsApp initialization failed:", error);
      store.updateStatus("disconnected", {
        lastError: error.message || "WhatsApp initialization failed"
      });
    });
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
