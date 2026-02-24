# dir/symbols

This repo orchestrates two submodules:

- `vscode-symbols` (VS Code icon theme fork)
- `zed-symbols` (Zed icon theme fork)

Goal: keep both forks as close to upstream as possible, with custom mappings
defined only at this root.

## Quickstart

```bash
git clone https://github.com/dir/symbols.git
cd symbols
pnpm run setup
```

## Custom Mappings

Edit:

- `custom-mappings.jsonc`
- Schema (auto-generated): `schema/custom-mappings.schema.json`

Example:

```json
{
  "fileExtensions": {
    "tfvars": "terraform"
  },
  "fileNames": {
    "Brewfile": "homebrew"
  },
  "folderNames": {
    "infra": "folder-assets"
  },
  "folderNamesExpanded": {
    "infra": "folder-assets"
  }
}
```

## Commands

- `pnpm run workspace:status`
  - Shows root + submodule git status.
- `pnpm run workspace:sync`
  - Syncs both submodules from upstream, applies root mappings, updates zed assets.
- `pnpm run schema:generate`
  - Regenerates `schema/custom-mappings.schema.json` from current `vscode-symbols` icon keys.
- `pnpm run demos:generate`
  - Recreates `demos/` with `file-extensions/`, `file-names/`, and `folder-names/` demo artifacts from the merged mappings.
  - Also writes `demos/report.json` with counts and any filename sanitization notes.
- `pnpm run workspace:publish`
  - Runs `workspace:sync`, commits needed changes, then pushes `vscode-symbols`, `zed-symbols`, and this root repo.
  - This is the one command to run after changing `custom-mappings.json`.

## Typical Flow

After editing `custom-mappings.jsonc`, run:

```bash
pnpm run workspace:publish
```
