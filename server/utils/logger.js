const fs = require("fs");
const path = require("path");

const logDirectory = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

function formatMessage(level, message, extra = {}) {
  const timestamp = new Date().toISOString();
  const extraStr = Object.keys(extra).length ? ` | ${JSON.stringify(extra)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${extraStr}\n`;
}

function writeLog(level, message, extra) {
  const formatted = formatMessage(level, message, extra);
  console[level === "error" ? "error" : "log"](formatted.trim());

  const fileName = `${new Date().toISOString().split("T")[0]}.log`;
  const filePath = path.join(logDirectory, fileName);

  fs.appendFile(filePath, formatted, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
}

const logger = {
  info: (message, extra) => writeLog("info", message, extra),
  error: (message, extra) => writeLog("error", message, extra),
  warn: (message, extra) => writeLog("warn", message, extra),
};

module.exports = logger;
