#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vscodeDir = path.join(rootDir, "vscode-symbols");
const zedDir = path.join(rootDir, "zed-symbols");

const run = (cmd, args, cwd = rootDir) => {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const hasChanges = (repoDir) => {
  const staged = spawnSync("git", ["diff", "--cached", "--quiet"], {
    cwd: repoDir,
  }).status;
  const unstaged = spawnSync("git", ["diff", "--quiet"], { cwd: repoDir }).status;
  return staged !== 0 || unstaged !== 0;
};

const commitIfChanged = (repoDir, message) => {
  run("git", ["add", "-A"], repoDir);
  if (!hasChanges(repoDir)) {
    return false;
  }
  run("git", ["commit", "-m", message], repoDir);
  return true;
};

run("node", ["./scripts/sync.mjs"], rootDir);

commitIfChanged(zedDir, "chore: sync generated assets from workspace");
commitIfChanged(rootDir, "chore: sync workspace mappings and submodule pointers");

console.log("Pushing vscode-symbols...");
run("git", ["push", "origin", "main"], vscodeDir);

console.log("Pushing zed-symbols...");
run("git", ["push", "origin", "main"], zedDir);

console.log("Pushing root workspace...");
run("git", ["push", "origin", "main"], rootDir);

console.log("Workspace publish complete.");
