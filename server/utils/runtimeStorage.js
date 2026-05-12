const fs = require("fs");
const path = require("path");
const { authPath, cachePath, legacyAuthPath, legacyCachePath } = require("../config/runtimePaths");

async function exists(targetPath) {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch (error) {
    return false;
  }
}

async function moveDirectory(fromPath, toPath) {
  if (!(await exists(fromPath)) || (await exists(toPath))) {
    return;
  }

  await fs.promises.mkdir(path.dirname(toPath), { recursive: true });

  try {
    await fs.promises.rename(fromPath, toPath);
  } catch (error) {
    if (error.code !== "EXDEV") {
      throw error;
    }

    await fs.promises.cp(fromPath, toPath, { recursive: true });
    await fs.promises.rm(fromPath, { recursive: true, force: true });
  }
}

async function migrateLegacyRuntimeStorage() {
  await moveDirectory(legacyAuthPath, authPath);
  await moveDirectory(legacyCachePath, cachePath);
}

module.exports = {
  migrateLegacyRuntimeStorage
};
