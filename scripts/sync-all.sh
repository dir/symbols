#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Syncing vscode-symbols from upstream..."
npm --prefix "$ROOT_DIR/vscode-symbols" run sync:upstream

echo "Building zed-symbols from local vscode-symbols..."
npm --prefix "$ROOT_DIR/zed-symbols" run build

echo "Done."
