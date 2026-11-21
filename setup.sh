#!/bin/sh
# One-time setup, run by Anvil from this folder: downloads zai-openai-proxy at a pinned commit, installs it and adds account-session support (patch v1).
set -eu
REPO="https://github.com/xaoLiu1222/zai-openai-proxy.git"
COMMIT="2f1cef059da2db95343c2f5d516544ba71f69f6e"

command -v node >/dev/null || { echo "Node.js 18+ is required: brew install node" >&2; exit 1; }
command -v git >/dev/null || { echo "git is required (xcode-select --install)" >&2; exit 1; }

if [ ! -d upstream/.git ]; then
  rm -rf upstream
  git clone --quiet "$REPO" upstream
fi
git -C upstream fetch --quiet origin "$COMMIT" 2>/dev/null || git -C upstream fetch --quiet origin
git -C upstream checkout --quiet --force "$COMMIT"
npm --prefix upstream install --omit=dev --ignore-scripts --no-audit --no-fund --loglevel=error
node patch-proxy.cjs
echo "zai-openai-proxy ready at $(git -C upstream rev-parse --short HEAD)"
