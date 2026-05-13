const { Client, LocalAuth } = require("whatsapp-web.js");
const { authPath, cachePath } = require("../config/runtimePaths");

function createWhatsAppClient() {
  return new Client({
    authStrategy: new LocalAuth({
      clientId: "primary-session",
      dataPath: authPath
    }),
    webVersionCache: {
      type: "local",
      path: cachePath
    },
    puppeteer: {
      headless: true,
      protocolTimeout: 120000,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    }
  });
}

module.exports = {
  createWhatsAppClient
};
