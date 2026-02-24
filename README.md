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

## Daily Commands

From this root directory:

- `pnpm run status`
  - Shows root and submodule status.
- `pnpm run sync:vscode`
  - Fast-forwards `vscode-symbols` from upstream (`miguelsolorio/vscode-symbols`).
- `pnpm run build:zed`
  - Regenerates `zed-symbols` theme/icons from local `vscode-symbols`.
- `pnpm run sync:all`
  - Runs `sync:vscode` then `build:zed`.

## Custom Mappings

Keep your Zed-specific custom mapping overrides in:

- `zed-symbols/src/custom-mappings.ts`

These are merged on top of upstream mappings during `pnpm run build:zed`.

## Commit Flow

1. Commit changes inside each submodule repository.
2. In this root repo, stage the submodule pointers and commit:

```bash
git add vscode-symbols zed-symbols .gitmodules
git commit -m "Update symbols submodule pointers"
```

## Notes

- `sync:vscode` intentionally fails if `vscode-symbols` has uncommitted changes.
- `submodules:sync` updates submodule URL/branch config and ensures they are initialized.
