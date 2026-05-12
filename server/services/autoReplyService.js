const { randomNumberInRange, sleep } = require("../utils/delay");
const { isPersonalChat, isPersonalChatId } = require("../utils/chatFilters");
const { sanitizeReplyText } = require("../utils/replySanitizer");

function createAutoReplyService({ store, openAIService, getClient }) {
  const pendingReplies = new Map();
  const collectionWindowMs = 2500;

  async function handleIncomingMessage(message) {
    const body = message.body?.trim();

    if (!body || message.fromMe) {
      return;
    }

    if (!isPersonalChatId(message.from)) {
      console.info(`Ignored non-personal chat: ${message.from || "unknown chat"}`);
      return;
    }

    const [chat, contact] = await Promise.all([message.getChat(), message.getContact()]);

    if (!isPersonalChat(chat)) {
      console.info(`Ignored non-personal chat object: ${chat.id?._serialized || message.from}`);
      return;
    }

    const contactName =
      contact.pushname ||
      contact.name ||
      chat.name ||
      contact.number ||
      message.from;

    const incomingTimestamp = message.timestamp
      ? new Date(message.timestamp * 1000).toISOString()
      : new Date().toISOString();

    store.recordMessage({
      id: message.id.id,
      chatId: message.from,
      chatName: contactName,
      body,
      createdAt: incomingTimestamp,
      unreadCount: chat.unreadCount || 0,
      direction: "incoming",
      aiReplied: false
    });

    const settings = store.getSettings();

    if (!settings.aiEnabled) {
      return;
    }

    queueReply({
      chatId: message.from,
      messageId: message.id.id,
      body,
      chatName: contactName,
      unreadCount: chat.unreadCount || 0
    });
  }

  function queueReply({ chatId, messageId, body, chatName, unreadCount }) {
    const existingReply = pendingReplies.get(chatId);
    const nextReply = existingReply || {
      chatId,
      messageIds: [],
      bodies: [],
      chatName,
      unreadCount: unreadCount || 0,
      timer: null,
      queuedAt: new Date().toISOString()
    };

    nextReply.messageIds.push(messageId);
    nextReply.bodies.push(body);
    nextReply.chatName = chatName;
    nextReply.unreadCount = unreadCount || nextReply.unreadCount || 0;
    nextReply.queuedAt = new Date().toISOString();

    if (nextReply.timer) {
      clearTimeout(nextReply.timer);
    }

    nextReply.timer = setTimeout(() => {
      flushReply(chatId).catch((error) => {
        store.clearPendingReply(chatId);
        store.setLastError(error.message || "Failed to process queued reply");
      });
    }, collectionWindowMs);

    pendingReplies.set(chatId, nextReply);
    store.setPendingReply(chatId, {
      chatName,
      messageCount: nextReply.bodies.length,
      queuedAt: nextReply.queuedAt
    });
  }

  async function flushReply(chatId) {
    const pendingReply = pendingReplies.get(chatId);

    if (!pendingReply) {
      return;
    }

    pendingReplies.delete(chatId);

    if (pendingReply.timer) {
      clearTimeout(pendingReply.timer);
    }

    const settings = store.getSettings();

    if (!settings.aiEnabled) {
      store.clearPendingReply(chatId);
      return;
    }

    const client = getClient();

    if (!client) {
      store.clearPendingReply(chatId);
      return;
    }

    const combinedMessage = pendingReply.bodies.join("\n").slice(0, 1500);
    const startedAt = Date.now();
    let chat = null;

    try {
      chat = await client.getChatById(chatId);

      const replyText = await openAIService.generateReply({
        customPrompt: settings.customPrompt,
        messageText: combinedMessage,
        contactName: pendingReply.chatName,
        conversationHistory: store.getRecentMessagesForChat(chatId, 10)
      });
      const safeReplyText = sanitizeReplyText(replyText);

      const targetDelay = randomNumberInRange(
        settings.replyDelayMinSeconds * 1000,
        settings.replyDelayMaxSeconds * 1000
      );

      const remainingDelay = Math.max(0, targetDelay - (Date.now() - startedAt));

      if (settings.typingSimulation && typeof chat.sendStateTyping === "function") {
        await chat.sendStateTyping();
      }

      await sleep(remainingDelay);
      await client.sendMessage(chatId, safeReplyText);

      if (settings.typingSimulation && typeof chat.clearState === "function") {
        await chat.clearState();
      }

      store.clearPendingReply(chatId);
      store.recordMessage({
        id: `${pendingReply.messageIds[pendingReply.messageIds.length - 1]}-ai`,
        chatId,
        chatName: pendingReply.chatName,
        body: safeReplyText,
        createdAt: new Date().toISOString(),
        unreadCount: 0,
        direction: "outgoing",
        aiReplied: true
      });
    } catch (error) {
      store.clearPendingReply(chatId);

      if (settings.typingSimulation && typeof chat.clearState === "function") {
        try {
          await chat.clearState();
        } catch (clearStateError) {
          // Preserve the original reply failure instead of hiding it behind cleanup noise.
        }
      }

      store.setLastError(error.message || "Failed to send AI reply");
    }
  }

  return {
    handleIncomingMessage
  };
}

module.exports = {
  createAutoReplyService
};
