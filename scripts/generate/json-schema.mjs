#!/usr/bin/env node

import * as JSONC from "jsonc-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const vscodeThemePath = path.join(rootDir, "vscode-symbols/src/symbol-icon-theme.json");
const schemaPath = path.join(rootDir, "custom-mappings.schema.json");

const readJsonFile = (filePath) => JSONC.parse(fs.readFileSync(filePath, "utf8"));

const sourceTheme = readJsonFile(vscodeThemePath);
const iconDefinitionKeys = Object.keys(sourceTheme.iconDefinitions ?? {}).toSorted();
const folderIconKeys = iconDefinitionKeys.filter((key) => key.startsWith("folder")).toSorted();

const mappingValueProperty = (enumValues, description) => ({
  type: "string",
  enum: enumValues,
  description,
});

const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://dir.github.io/symbols/custom-mappings.schema.json",
  title: "Symbols Custom Mappings",
  description:
    "Custom mapping overrides merged into vscode-symbols before zed-symbols assets are generated.",
  type: "object",
  additionalProperties: false,
  properties: {
    $schema: {
      type: "string",
      description: "Optional reference to this schema file for editor IntelliSense.",
    },
    fileExtensions: {
      type: "object",
      description:
        'Map extension names (without \'*.\' prefix) to an icon key. Example: { "tfvars": "terraform" }',
      additionalProperties: mappingValueProperty(
        iconDefinitionKeys,
        "Icon key from vscode-symbols iconDefinitions.",
      ),
      default: {},
    },
    fileNames: {
      type: "object",
      description: 'Map exact file names to an icon key. Example: { "Brewfile": "homebrew" }',
      additionalProperties: mappingValueProperty(
        iconDefinitionKeys,
        "Icon key from vscode-symbols iconDefinitions.",
      ),
      default: {},
    },
    folderNames: {
      type: "object",
      description:
        'Map directory names to a folder icon key. Example: { "infra": "folder-assets" }',
      additionalProperties: mappingValueProperty(
        folderIconKeys,
        "Folder icon key from vscode-symbols iconDefinitions (keys starting with 'folder').",
      ),
      default: {},
    },
    folderNamesExpanded: {
      type: "object",
      description:
        'Map directory names to expanded folder icon key. Example: { "infra": "folder-assets" }',
      additionalProperties: mappingValueProperty(
        folderIconKeys,
        "Folder icon key from vscode-symbols iconDefinitions (keys starting with 'folder').",
      ),
      default: {},
    },
  },
  required: ["fileExtensions", "fileNames", "folderNames", "folderNamesExpanded"],
};

fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

console.log(`Generated ${path.relative(rootDir, schemaPath)}`);
