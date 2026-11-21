#!/bin/sh
# Started by Anvil when a zai-web model is first used; stopped when Anvil quits.
set -eu
. ./find-chrome.sh
export PORT="${PORT:-39876}"
exec node -r ./localhost-only.cjs upstream/zai-proxy.js
