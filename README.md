# Symbols Workspace

Root orchestration repository for:

- `vscode-symbols` (VS Code icon theme fork)
- `zed-symbols` (Zed icon theme fork)

Both are tracked as Git submodules so this repository can pin a known-good pair
of commits.

## Initial Setup

```bash
git clone <your-root-repo-url>
cd symbols
pnpm run submodules:init
```

## Command Reference

Run all commands from this root directory.

| Command | When to use | What it does |
| --- | --- | --- |
| `pnpm run submodules:init` | First clone of this workspace | Initializes and checks out both submodules recursively |
| `pnpm run submodules:sync` | After changing `.gitmodules` URL/branch settings | Syncs submodule config and ensures submodules are initialized |
| `pnpm run submodules:status` | Anytime you want a quick state check | Shows submodule commit pointers and root git status |
| `pnpm run vscode:sync` | Pull latest upstream VSCode icons into your fork | Runs `vscode-symbols` upstream fast-forward sync |
| `pnpm run mappings:apply` | After editing `custom-mappings.json` | Rebuilds `vscode-symbols/src/symbol-icon-theme.modified.json` |
| `pnpm run zed:build` | Rebuild Zed theme/icons from local VSCode source | Applies mappings, then runs `zed-symbols` build |
| `pnpm run workspace:sync` | Normal day-to-day update flow | Runs `vscode:sync`, then `zed:build` |

## Custom Mappings

Keep your Zed-specific custom mapping overrides in:

- `custom-mappings.json`

These are merged on top of upstream mappings and written to:

- `vscode-symbols/src/symbol-icon-theme.modified.json`

That modified theme is then consumed by the Zed build.

Recommended routine:

1. Edit `custom-mappings.json` if needed.
2. Run `pnpm run workspace:sync`.
3. Review changes in `vscode-symbols` and `zed-symbols`.
4. Commit submodules, then commit updated submodule pointers in this root repo.

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

## Commit Flow

1. Commit changes inside each submodule repository.
2. In this root repo, stage the submodule pointers and commit:

```bash
git add vscode-symbols zed-symbols .gitmodules
git commit -m "Update symbols submodule pointers"
```

## Notes

- `vscode:sync` intentionally fails if `vscode-symbols` has uncommitted changes.
- `submodules:sync` updates submodule URL/branch config and ensures they are initialized.
