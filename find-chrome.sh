# Sourced by start.sh: sets CHROME_PATH to a Chrome-family browser on this Mac (yours wins if already set).
if [ -z "${CHROME_PATH:-}" ]; then
  for c in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do
    if [ -x "$c" ]; then CHROME_PATH="$c"; break; fi
  done
fi
if [ -z "${CHROME_PATH:-}" ]; then
  echo "No Chrome, Chromium, Brave or Edge found. Install one, or set CHROME_PATH." >&2
  exit 1
fi
export CHROME_PATH
