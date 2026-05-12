const fs = require("fs");
const path = require("path");

async function ensureParentDirectory(filePath) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
}

async function readJsonFile(filePath, fallbackValue) {
  try {
    const raw = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) {
      throw error;
    }

    return fallbackValue;
  }
}

async function writeJsonFile(filePath, data) {
  await ensureParentDirectory(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function pathExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = {
  pathExists,
  readJsonFile,
  writeJsonFile
};
