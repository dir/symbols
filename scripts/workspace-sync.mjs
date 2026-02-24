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

const runCapture = (cmd, args, cwd = rootDir) => {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    status: result.status ?? 1,
    stdout: (result.stdout ?? "").trim(),
  };
};

const ensureCleanRepo = (repoDir, label) => {
  const unstaged = runCapture("git", ["diff", "--quiet"], repoDir).status;
  const staged = runCapture("git", ["diff", "--cached", "--quiet"], repoDir).status;

  if (unstaged !== 0 || staged !== 0) {
    console.error(`${label} has uncommitted changes. Commit or stash first.`);
    process.exit(1);
  }
};

const ensureRemote = (repoDir, name, url) => {
  const current = runCapture("git", ["remote", "get-url", name], repoDir);
  if (current.status !== 0) {
    run("git", ["remote", "add", name, url], repoDir);
    return;
  }

  if (current.stdout !== url) {
    run("git", ["remote", "set-url", name, url], repoDir);
  }
};

const rebaseOnUpstream = (repoDir, upstreamRef) => {
  run("git", ["checkout", "main"], repoDir);
  run("git", ["fetch", "upstream", "--tags"], repoDir);
  run("git", ["rebase", upstreamRef], repoDir);
};

run("git", ["submodule", "update", "--init", "--recursive"], rootDir);

ensureCleanRepo(vscodeDir, "vscode-symbols");
ensureCleanRepo(zedDir, "zed-symbols");

ensureRemote(
  vscodeDir,
  "upstream",
  "https://github.com/miguelsolorio/vscode-symbols.git",
);
ensureRemote(
  zedDir,
  "upstream",
  "https://github.com/sebastiandotdev/zed-symbols.git",
);

console.log("Syncing vscode-symbols from upstream/main...");
rebaseOnUpstream(vscodeDir, "upstream/main");

console.log("Syncing zed-symbols from upstream/main...");
rebaseOnUpstream(zedDir, "upstream/main");

console.log("Applying root custom mappings...");
run("node", ["./scripts/apply-custom-mappings.mjs"], rootDir);

console.log("Syncing zed assets from local vscode-symbols...");
run("node", ["./scripts/sync-zed-assets.mjs"], rootDir);

console.log("Workspace sync complete.");
