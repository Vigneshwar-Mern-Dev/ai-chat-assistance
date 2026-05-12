function getSerializedChatId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id?._serialized || value._serialized || "";
}

function isPersonalChatId(value) {
  const chatId = getSerializedChatId(value);

  if (!chatId) {
    return false;
  }

  if (
    chatId === "status@broadcast" ||
    chatId.endsWith("@g.us") ||
    chatId.endsWith("@newsletter") ||
    chatId.endsWith("@broadcast")
  ) {
    return false;
  }

  return chatId.endsWith("@c.us") || chatId.endsWith("@lid");
}

function isPersonalChat(chat) {
  return Boolean(chat) && !chat.isGroup && isPersonalChatId(chat);
}

module.exports = {
  isPersonalChat,
  isPersonalChatId
};
