const path = require("path");
const { readJsonFile, writeJsonFile } = require("../utils/fileStore");

const replyScriptsFilePath = path.join(process.cwd(), "server", "data", "replyScripts.json");

// In-memory cache — invalidated on every write so disk reads only happen at startup
// and after a mutation.
let cachedScripts = null;

async function loadReplyScripts() {
  if (cachedScripts !== null) {
    return cachedScripts;
  }

  cachedScripts = await readJsonFile(replyScriptsFilePath, {});
  return cachedScripts;
}

async function saveReplyScripts(replyScripts) {
  await writeJsonFile(replyScriptsFilePath, replyScripts || {});
  // Update cache after a successful write
  cachedScripts = replyScripts || {};
  return cachedScripts;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getEnabledScriptEntries(replyScripts) {
  return Object.entries(replyScripts || {}).filter(([, script]) => {
    return script?.enabled !== false && Array.isArray(script.replies) && script.replies.length > 0;
  });
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeIntent(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function normalizeStringList(value, { maxItems = 30, maxItemLength = 240 } = {}) {
  const items = Array.isArray(value)
    ? value
    : String(value || "").split(/\r?\n|,/);

  return [...new Set(
    items
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .map((item) => item.slice(0, maxItemLength))
  )].slice(0, maxItems);
}

function normalizeReplyScript(value = {}) {
  return {
    enabled: value.enabled !== false,
    keywords: normalizeStringList(value.keywords, {
      maxItems: 40,
      maxItemLength: 80
    }),
    replies: normalizeStringList(value.replies, {
      maxItems: 20,
      maxItemLength: 700
    })
  };
}

function getReplyForIntent(replyScripts, intent) {
  const script = replyScripts?.[intent];

  if (!script || script.enabled === false || !Array.isArray(script.replies) || !script.replies.length) {
    return null;
  }

  return getRandomItem(script.replies);
}

function findKeywordIntent(replyScripts, messageText) {
  const normalizedMessage = normalizeText(messageText);

  if (!normalizedMessage) {
    return null;
  }

  for (const [intent, script] of getEnabledScriptEntries(replyScripts)) {
    const keywords = Array.isArray(script.keywords) ? script.keywords : [];

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (normalizedKeyword && normalizedMessage.includes(normalizedKeyword)) {
        return intent;
      }
    }
  }

  return null;
}

async function upsertReplyScript(intentValue, scriptValue) {
  const intent = normalizeIntent(intentValue);

  if (!intent) {
    throw new Error("Script intent is required");
  }

  const script = normalizeReplyScript(scriptValue);

  if (!script.replies.length) {
    throw new Error("Add at least one reply for this script");
  }

  const replyScripts = await loadReplyScripts();
  replyScripts[intent] = script;
  await saveReplyScripts(replyScripts);

  return { intent, script };
}

async function deleteReplyScript(intentValue) {
  const intent = normalizeIntent(intentValue);

  if (!intent) {
    throw new Error("Script intent is required");
  }

  const replyScripts = await loadReplyScripts();
  delete replyScripts[intent];
  await saveReplyScripts(replyScripts);

  return intent;
}

async function resolveScriptedReply({ messageText, classifyIntent }) {
  const replyScripts = await loadReplyScripts();
  const enabledIntents = getEnabledScriptEntries(replyScripts).map(([intent]) => intent);

  if (!enabledIntents.length) {
    return null;
  }

  const keywordIntent = findKeywordIntent(replyScripts, messageText);

  if (keywordIntent) {
    return {
      intent: keywordIntent,
      source: "keyword",
      replyText: getReplyForIntent(replyScripts, keywordIntent)
    };
  }

  if (typeof classifyIntent !== "function") {
    return null;
  }

  const classification = await classifyIntent(enabledIntents);
  const confidence = Number(classification?.confidence || 0);
  const intent = classification?.intent;

  if (!intent || !enabledIntents.includes(intent) || confidence < 0.65) {
    return null;
  }

  return {
    intent,
    source: "ai",
    confidence,
    replyText: getReplyForIntent(replyScripts, intent)
  };
}

module.exports = {
  deleteReplyScript,
  loadReplyScripts,
  normalizeIntent,
  upsertReplyScript,
  resolveScriptedReply
};
