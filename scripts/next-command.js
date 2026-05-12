const { spawnSync } = require("child_process");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/next-command.js <next-command> [...args]");
  process.exit(1);
}

const command = args[0];
const defaultDistDir = command === "dev" ? ".next-dev" : ".next-build";

if (!process.env.NEXT_DIST_DIR || process.env.NEXT_DIST_DIR === ".next-runtime") {
  process.env.NEXT_DIST_DIR = defaultDistDir;
}

const nextCliPath = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextCliPath, ...args], {
  env: process.env,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
