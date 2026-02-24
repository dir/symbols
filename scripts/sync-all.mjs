#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const run = (args) => {
  const result = spawnSync("pnpm", args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

console.log("Syncing vscode-symbols from upstream...");
run(["--dir", "./vscode-symbols", "sync:upstream"]);

console.log("Building zed-symbols from local vscode-symbols...");
run(["--dir", "./zed-symbols", "build"]);

console.log("Done.");
