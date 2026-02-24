#!/usr/bin/env node

import * as JSONC from "jsonc-parser";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const vscodeDir = path.join(rootDir, "vscode-symbols");
const previewDir = path.join(rootDir, "preview");

const paths = {
  fileExtensions: path.join(previewDir, "file-extensions"),
  fileNames: path.join(previewDir, "file-names"),
  folderNames: path.join(previewDir, "folder-names"),
};

const run = (cmd, args, cwd = rootDir) => {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const readJsonFile = (filePath) => JSONC.parse(fs.readFileSync(filePath, "utf8"));

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const toSafeName = (name) =>
  name.replaceAll("/", "__").replaceAll("\\", "__").replaceAll("\0", "").trim();

const createUniqueFile = (dirPath, desiredName, content) => {
  let safeName = toSafeName(desiredName);
  if (!safeName || safeName === "." || safeName === "..") {
    safeName = "demo.txt";
  }

  const ext = path.extname(safeName);
  const base = ext ? safeName.slice(0, -ext.length) : safeName;

  let candidate = safeName;
  let index = 1;

  while (fs.existsSync(path.join(dirPath, candidate))) {
    candidate = `${base}--${index}${ext}`;
    index += 1;
  }

  fs.writeFileSync(path.join(dirPath, candidate), content);
  return candidate;
};

const createUniqueDir = (dirPath, desiredName) => {
  let safeName = toSafeName(desiredName);
  if (!safeName || safeName === "." || safeName === "..") {
    safeName = "demo-folder";
  }

  let candidate = safeName;
  let index = 1;

  while (fs.existsSync(path.join(dirPath, candidate))) {
    candidate = `${safeName}--${index}`;
    index += 1;
  }

  const fullPath = path.join(dirPath, candidate);
  fs.mkdirSync(fullPath, { recursive: true });
  return candidate;
};

const resolveThemePath = () => {
  const modifiedThemePath = path.join(vscodeDir, "src/symbol-icon-theme.modified.json");
  const sourceThemePath = path.join(vscodeDir, "src/symbol-icon-theme.json");

  if (fs.existsSync(modifiedThemePath)) {
    return modifiedThemePath;
  }

  if (fs.existsSync(sourceThemePath)) {
    return sourceThemePath;
  }

  throw new Error(
    "Unable to locate vscode-symbols theme. Expected src/symbol-icon-theme.modified.json or src/symbol-icon-theme.json",
  );
};

run("node", ["./scripts/sync-vscode.mjs"], rootDir);

const themePath = resolveThemePath();
const theme = readJsonFile(themePath);

fs.rmSync(previewDir, { recursive: true, force: true });
ensureDir(paths.fileExtensions);
ensureDir(paths.fileNames);
ensureDir(paths.folderNames);

const report = {
  sourceTheme: path.relative(rootDir, themePath),
  counts: {
    fileExtensions: 0,
    fileNames: 0,
    folderNames: 0,
  },
  remappedNames: [],
};

for (const [extension, iconKey] of Object.entries(theme.fileExtensions ?? {}).toSorted(([a], [b]) =>
  a.localeCompare(b),
)) {
  const desiredName = extension ? `demo.${toSafeName(extension)}` : "demo-without-extension.txt";
  const createdName = createUniqueFile(
    paths.fileExtensions,
    desiredName,
    `extension=${extension}\nicon=${iconKey}\n`,
  );

  if (createdName !== desiredName) {
    report.remappedNames.push({
      type: "fileExtensions",
      original: desiredName,
      created: createdName,
    });
  }

  report.counts.fileExtensions += 1;
}

for (const [fileName, iconKey] of Object.entries(theme.fileNames ?? {}).toSorted(([a], [b]) =>
  a.localeCompare(b),
)) {
  const desiredName = toSafeName(fileName);
  const createdName = createUniqueFile(
    paths.fileNames,
    desiredName,
    `fileName=${fileName}\nicon=${iconKey}\n`,
  );

  if (createdName !== fileName) {
    report.remappedNames.push({
      type: "fileNames",
      original: fileName,
      created: createdName,
    });
  }

  report.counts.fileNames += 1;
}

for (const [folderName, iconKey] of Object.entries(theme.folderNames ?? {}).toSorted(([a], [b]) =>
  a.localeCompare(b),
)) {
  const createdName = createUniqueDir(paths.folderNames, folderName);
  const markerFile = path.join(paths.folderNames, createdName, ".demo-info.txt");
  fs.writeFileSync(markerFile, `folderName=${folderName}\nicon=${iconKey}\n`);

  if (createdName !== folderName) {
    report.remappedNames.push({
      type: "folderNames",
      original: folderName,
      created: createdName,
    });
  }

  report.counts.folderNames += 1;
}

fs.writeFileSync(path.join(previewDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(previewDir, "README.md"),
  [
    "# Previews",
    "",
    "Generated demo artifacts for icon mapping verification.",
    "",
    "- `file-extensions/`: one file per `fileExtensions` mapping",
    "- `file-names/`: one file per `fileNames` mapping",
    "- `folder-names/`: one folder per `folderNames` mapping",
    "",
    "Generation source:",
    `- ${path.relative(rootDir, themePath)}`,
    "",
    `Counts: ${JSON.stringify(report.counts)}`,
    "",
    "If any mapping key needed sanitization for filesystem compatibility, see `report.json`.",
    "",
  ].join("\n"),
);

console.log(
  `Generated demos in ${path.relative(rootDir, previewDir)} ` +
    `(${report.counts.fileExtensions} extensions, ${report.counts.fileNames} file names, ${report.counts.folderNames} folder names).`,
);
