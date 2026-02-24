#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const customMappingsPath = path.join(rootDir, "custom-mappings.json");
const vscodeSourceThemePath = path.join(rootDir, "vscode-symbols/src/symbol-icon-theme.json");
const vscodeModifiedThemePath = path.join(
  rootDir,
  "vscode-symbols/src/symbol-icon-theme.modified.json",
);

const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const sourceTheme = readJsonFile(vscodeSourceThemePath);
const customMappings = readJsonFile(customMappingsPath);

const mergedTheme = {
  ...sourceTheme,
  fileExtensions: {
    ...sourceTheme.fileExtensions,
    ...customMappings.fileExtensions,
  },
  fileNames: {
    ...sourceTheme.fileNames,
    ...customMappings.fileNames,
  },
  folderNames: {
    ...sourceTheme.folderNames,
    ...customMappings.folderNames,
  },
  folderNamesExpanded: {
    ...sourceTheme.folderNamesExpanded,
    ...customMappings.folderNamesExpanded,
  },
};

fs.writeFileSync(vscodeModifiedThemePath, `${JSON.stringify(mergedTheme, null, "\t")}\n`);

console.log(`Applied custom mappings to ${path.relative(rootDir, vscodeModifiedThemePath)}`);
