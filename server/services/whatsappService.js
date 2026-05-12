const fs = require("fs");
const QRCode = require("qrcode");
const { authPath, cachePath } = require("../config/runtimePaths");
const { createWhatsAppClient } = require("../bot/client");
const { createAutoReplyService } = require("./autoReplyService");
const { isPersonalChat } = require("../utils/chatFilters");

function createWhatsAppService({ store, openAIService }) {
  let client = null;
  let initializingPromise = null;
  let reconnectTimer = null;
  let chatSyncTimer = null;
  let manualActionInProgress = false;

  const autoReplyService = createAutoReplyService({
    store,
    openAIService,
    getClient: () => client
  });

  async function buildChatSnapshot() {
    if (!client) {
      return;
    }

    const chats = await client.getChats();
    const visibleChats = chats
      .filter(isPersonalChat)
      .sort((left, right) => (right.timestamp || 0) - (left.timestamp || 0))
      .slice(0, 50)
      .map((chat) => ({
        id: chat.id._serialized,
        name: chat.name || chat.formattedTitle || chat.id.user,
        lastMessage: chat.lastMessage?.body || "",
        lastMessageAt: chat.timestamp ? new Date(chat.timestamp * 1000).toISOString() : null,
        unreadCount: chat.unreadCount || 0,
        aiReplied: false
      }));

    store.setChatsFromWhatsapp(visibleChats);
  }

  async function destroyClient() {
    if (!client) {
      return;
    }

    clearChatSyncTimer();

    const currentClient = client;
    client = null;

    try {
      await currentClient.destroy();
    } catch (error) {
      store.setLastError(error.message || "Failed to destroy WhatsApp client");
    }
  }

  function clearChatSyncTimer() {
    if (chatSyncTimer) {
      clearInterval(chatSyncTimer);
      chatSyncTimer = null;
    }
  }

  function clearReconnectTimer() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function startChatSyncLoop() {
    clearChatSyncTimer();
    chatSyncTimer = setInterval(() => {
      buildChatSnapshot().catch((error) => {
        store.setLastError(error.message || "Background chat sync failed");
      });
    }, 45000);
  }

  function scheduleReconnect(reason = "Connection lost") {
    if (manualActionInProgress) {
      return;
    }

    clearReconnectTimer();
    store.incrementReconnectAttempts();
    store.updateStatus("reconnecting", {
      qrCode: null,
      lastError: reason
    });

    reconnectTimer = setTimeout(() => {
      initialize({ forceRestart: true }).catch((error) => {
        store.setLastError(error.message || "Reconnect failed");
      });
    }, 5000);
  }

  function bindClientEvents(currentClient) {
    currentClient.on("qr", async (qrText) => {
      try {
        const qrCode = await QRCode.toDataURL(qrText);
        store.setQrCodeStatus(qrCode);
      } catch (error) {
        store.setLastError(error.message || "Failed to render QR code");
      }
    });

    currentClient.on("authenticated", () => {
      store.syncSessionPresence();
    });

    currentClient.on("ready", async () => {
      try {
        clearReconnectTimer();
        store.resetReconnectAttempts();
        store.setConnectedClient(currentClient.info || {});
        startChatSyncLoop();
        await buildChatSnapshot();
      } catch (error) {
        store.setLastError(error.message || "Failed to prepare WhatsApp client");
      }
    });

    currentClient.on("auth_failure", (message) => {
      store.updateStatus("disconnected", {
        lastError: message || "Authentication failed"
      });
      scheduleReconnect("Authentication failed");
    });

    currentClient.on("disconnected", (reason) => {
      store.updateStatus("disconnected", {
        lastError: String(reason || "Disconnected")
      });
      scheduleReconnect(String(reason || "Disconnected"));
    });

    currentClient.on("message", async (message) => {
      try {
        await autoReplyService.handleIncomingMessage(message);
      } catch (error) {
        store.setLastError(error.message || "Failed to process message");
      }
    });
  }

  async function initialize({ forceRestart = false } = {}) {
    clearReconnectTimer();

    if (initializingPromise) {
      return initializingPromise;
    }

    initializingPromise = (async () => {
      if (forceRestart) {
        store.updateStatus("reconnecting");
        const previousManualActionState = manualActionInProgress;
        manualActionInProgress = true;

        try {
          await destroyClient();
        } finally {
          manualActionInProgress = previousManualActionState;
          clearReconnectTimer();
        }
      }

      if (client) {
        return client;
      }

      client = createWhatsAppClient();
      bindClientEvents(client);
      await client.initialize();
      return client;
    })();

    try {
      return await initializingPromise;
    } finally {
      initializingPromise = null;
    }
  }

  async function reconnect() {
    manualActionInProgress = false;
    store.updateStatus("reconnecting", {
      qrCode: null
    });
    await initialize({ forceRestart: true });
  }

  async function logout() {
    if (!client) {
      return;
    }

    manualActionInProgress = true;
    clearReconnectTimer();

    try {
      await client.logout();
    } finally {
      await destroyClient();
      store.updateStatus("disconnected", {
        connectedAt: null,
        qrCode: null,
        lastError: null,
        clientName: null,
        phoneNumber: null
      });
      store.syncSessionPresence();
      manualActionInProgress = false;
    }
  }

  async function resetSession() {
    manualActionInProgress = true;
    clearReconnectTimer();

    try {
      await destroyClient();
      await fs.promises.rm(authPath, { recursive: true, force: true });
      await fs.promises.rm(cachePath, { recursive: true, force: true });

      store.updateStatus("disconnected", {
        connectedAt: null,
        qrCode: null,
        lastError: null,
        clientName: null,
        phoneNumber: null
      });
      store.syncSessionPresence();
    } finally {
      manualActionInProgress = false;
    }

    await reconnect();
  }

  async function regenerateQr() {
    await reconnect();
  }

  return {
    buildChatSnapshot,
    getClient: () => client,
    initialize,
    logout,
    reconnect,
    regenerateQr,
    resetSession
  };
}

module.exports = {
  createWhatsAppService
};
