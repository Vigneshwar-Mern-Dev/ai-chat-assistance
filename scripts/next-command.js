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

// Always pass an explicit port for dev/start so Next.js never silently
// auto-increments and collides with the backend port (3001).
const nextPort = process.env.NEXT_PORT || "3000";
const extraArgs = [];
if ((command === "dev" || command === "start") && !args.includes("-p") && !args.includes("--port")) {
  extraArgs.push("-p", nextPort);
}

const envOptions = { ...process.env };
if (!envOptions.NODE_OPTIONS) {
  envOptions.NODE_OPTIONS = '--max-old-space-size=8192';
} else if (!envOptions.NODE_OPTIONS.includes('--max-old-space-size')) {
  envOptions.NODE_OPTIONS += ' --max-old-space-size=8192';
}

const nextCliPath = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextCliPath, command, ...extraArgs, ...args.slice(1)], {
  env: envOptions,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
