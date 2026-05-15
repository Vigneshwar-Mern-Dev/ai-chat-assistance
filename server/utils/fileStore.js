const fs = require("fs");
const path = require("path");
const os = require("os");

async function ensureParentDirectory(filePath) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
}

async function readJsonFile(filePath, fallbackValue) {
  try {
    const raw = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    // ENOENT = file not yet created (normal on first boot)
    // SyntaxError = file is corrupted — fall back to default and let the caller recover
    if (error.code === "ENOENT" || error instanceof SyntaxError) {
      return fallbackValue;
    }

    throw error;
  }
}

/**
 * Write JSON data atomically: write to a temp file first, then rename.
 * On POSIX (Linux/macOS) rename is an atomic syscall, so a crash mid-write
 * will never leave the target file in a corrupted partial state.
 * On Windows rename is not atomic, but it still prevents zero-byte files
 * because the old file is only replaced after the write succeeds.
 */
async function writeJsonFile(filePath, data) {
  await ensureParentDirectory(filePath);

  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  try {
    await fs.promises.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf8");
    await fs.promises.rename(tmpPath, filePath);
  } catch (error) {
    // Clean up the temp file if rename fails (e.g. cross-device on some setups)
    await fs.promises.unlink(tmpPath).catch(() => {});
    throw error;
  }
}

function pathExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = {
  pathExists,
  readJsonFile,
  writeJsonFile
};
