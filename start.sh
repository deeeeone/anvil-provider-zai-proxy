#!/bin/sh
# Started by Anvil when a zai-web model is first used; stopped when Anvil quits.
set -eu
. ./find-chrome.sh
# Anvil hands over the signed-in token when the owner has connected an account.
if [ -n "${ANVIL_PROVIDER_LOCALSTORAGE:-}" ]; then
  ZAI_TOKEN=$(node -e 'try{const c=JSON.parse(process.env.ANVIL_PROVIDER_LOCALSTORAGE);process.stdout.write(c.token||"")}catch(e){}')
  [ -n "$ZAI_TOKEN" ] && export ZAI_TOKEN
fi
export ZAI_PROFILE="${ZAI_PROFILE:-$PWD/.chrome-profile}"
export PORT="${PORT:-39876}"
exec node -r ./localhost-only.cjs upstream/zai-proxy.js
