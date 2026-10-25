// Deliberately manual. Never call from build/install/preview/CI lifecycle hooks.
const { spawnSync } = require("node:child_process");
if (process.env.VERCEL || process.env.CI || process.env.CONFIRM_MANUAL_MIGRATION !== "yes") {
  console.error("Migration refused. Use the manual release runbook outside Vercel/CI.");
  process.exit(1);
}
const result = spawnSync(process.execPath, [require.resolve("prisma/build/index.js"), "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
