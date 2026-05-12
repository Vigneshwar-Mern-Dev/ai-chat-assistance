const path = require("path");
const os = require("os");

const runtimeRootPath = process.env.WWEBJS_DATA_ROOT
  ? path.resolve(process.env.WWEBJS_DATA_ROOT)
  : path.join(os.tmpdir(), "vr-2-runtime");

const authPath = path.join(runtimeRootPath, "wwebjs_auth");
const cachePath = path.join(runtimeRootPath, "wwebjs_cache");
const legacyAuthPath = path.join(process.cwd(), ".wwebjs_auth");
const legacyCachePath = path.join(process.cwd(), ".wwebjs_cache");

module.exports = {
  authPath,
  cachePath,
  legacyAuthPath,
  legacyCachePath,
  runtimeRootPath
};
