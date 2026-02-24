#!/usr/bin/env node

import * as JSONC from "jsonc-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vscodeDir = path.join(rootDir, "vscode-symbols");
const zedDir = path.join(rootDir, "zed-symbols");

const keyMapping = {
  git: "vcs",
  console: "terminal",
  code: "json",
  coffeescript: "coffee",
  default: "file",
  storage: "database",
  template: "templ",
};

const toZedIconKey = (iconKey) => keyMapping[iconKey] || iconKey;

const resolveVscodeThemePath = () => {
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

const readJsonFile = (filePath) => JSONC.parse(fs.readFileSync(filePath, "utf8"));

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const syncFlatDir = (sourceDir, destDir) => {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing source directory: ${sourceDir}`);
  }

  ensureDir(destDir);

  const sourceFiles = new Set(fs.readdirSync(sourceDir));

  fs.readdirSync(destDir).forEach((file) => {
    if (!sourceFiles.has(file)) {
      fs.rmSync(path.join(destDir, file));
    }
  });

  sourceFiles.forEach((file) => {
    fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
  });
};

const themePath = resolveVscodeThemePath();
const symbolsIconTheme = readJsonFile(themePath);

const transformedIconDefinitions = Object.fromEntries(
  Object.entries(symbolsIconTheme.iconDefinitions ?? {})
    .filter(([key]) => !key.startsWith("folder"))
    .map(([key, value]) => [
      toZedIconKey(key),
      {
        path: value.iconPath,
      },
    ]),
);

const folderIconDefinitions = Object.fromEntries(
  Object.entries(symbolsIconTheme.iconDefinitions ?? {})
    .filter(([key]) => key.startsWith("folder"))
    .map(([key, value]) => [
      key,
      {
        iconPath: value.iconPath,
      },
    ]),
);

const transformedFileNames = Object.entries(symbolsIconTheme.fileNames ?? {}).reduce(
  (acc, [key, value]) => {
    const normalizedValue = toZedIconKey(value);
    acc[key.toLowerCase()] = normalizedValue;
    acc[key.toUpperCase()] = normalizedValue;
    return acc;
  },
  {},
);

const transformedFileExtensions = Object.fromEntries(
  Object.entries(symbolsIconTheme.fileExtensions ?? {}).map(([key, value]) => [
    key,
    toZedIconKey(value),
  ]),
);

const namedDirectoryIcons = {};

Object.entries(symbolsIconTheme.folderNames ?? {}).forEach(([folderName, iconKey]) => {
  const collapsedIcon = folderIconDefinitions[iconKey];
  const expandedIconKey = symbolsIconTheme.folderNamesExpanded?.[folderName];
  const expandedIcon = expandedIconKey ? folderIconDefinitions[expandedIconKey] : collapsedIcon;

  if (!collapsedIcon) {
    return;
  }

  const iconPaths = {
    collapsed: collapsedIcon.iconPath,
    expanded: expandedIcon?.iconPath || collapsedIcon.iconPath,
  };

  [folderName, `.${folderName}`, `_${folderName}`, `__${folderName}__`].forEach((variation) => {
    namedDirectoryIcons[variation] = iconPaths;
  });
});

const zedManifest = {
  $schema: "https://zed.dev/schema/icon_themes/v0.3.0.json",
  name: "Symbols Icon Theme",
  author: "Zed Industries",
  themes: [
    {
      name: "Symbols Icon Theme",
      appearance: "dark",
      file_icons: transformedIconDefinitions,
      directory_icons: {
        collapsed: "./icons/folders/folder.svg",
        expanded: "./icons/folders/folder-open.svg",
      },
      named_directory_icons: namedDirectoryIcons,
      file_suffixes: transformedFileExtensions,
      file_stems: transformedFileNames,
    },
  ],
};

ensureDir(path.join(zedDir, "icon_themes"));
fs.writeFileSync(
  path.join(zedDir, "icon_themes/symbols-icon-theme.json"),
  JSON.stringify(zedManifest, null, 2),
);

syncFlatDir(path.join(vscodeDir, "src/icons/files"), path.join(zedDir, "icons/files"));
syncFlatDir(path.join(vscodeDir, "src/icons/folders"), path.join(zedDir, "icons/folders"));

console.log("Synced zed-symbols assets from local vscode-symbols theme.");
