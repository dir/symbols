# Symbols Workspace

This repo orchestrates two submodules:

- `vscode-symbols` (VS Code icon theme fork)
- `zed-symbols` (Zed icon theme fork)

Goal: keep both forks as close to upstream as possible, with custom mappings
defined only at this root.

## Setup

```bash
git clone <your-root-repo-url>
cd symbols
pnpm run setup
```

## Custom Mappings

Edit:

- `custom-mappings.json`

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
- `pnpm run workspace:publish`
  - Runs `workspace:sync`, commits needed changes, then pushes `vscode-symbols`, `zed-symbols`, and this root repo.
  - This is the one command to run after changing `custom-mappings.json`.

## Typical Flow

After editing `custom-mappings.json`, run:

```bash
pnpm run workspace:publish
```
