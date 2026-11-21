# Z.ai Chat for Anvil (on device)

An [Anvil](https://github.com/deeeeone/Anvil) provider plugin that gives you **GLM models from chat.z.ai, for free with a guest session**, by running [xaoLiu1222/zai-openai-proxy](https://github.com/xaoLiu1222/zai-openai-proxy) on your Mac. There's no server to deploy and no API key: Anvil sets it up the first time you use it, starts it when you pick a `zai-web/…` model, and stops it when Anvil quits.

> [!WARNING]
> **Status, 21 November 2026: not working.** chat.z.ai now asks for a captcha on guest requests (`FRONTEND_CAPTCHA_REQUIRED`), which zai-openai-proxy can't get past, so every reply comes back empty. The plugin itself installs and starts correctly; it will work again once the upstream proxy catches up (then `COMMIT` in `setup.sh` gets bumped here). For GLM models today, use the **Z.ai** preset in Anvil with an API key from z.ai.

## Install

In Anvil: **Settings → Provider → Add provider → From GitHub**, paste

```
https://github.com/deeeeone/anvil-provider-zai-proxy
```

and confirm. Then pick `zai-web/x-preview-l` (GLM-5.3-Flash, the model guests can use).

**Needs:** Node.js 18+ (`brew install node`), git, and Google Chrome (or Chromium, Brave, Edge): the proxy drives a headless browser to sign requests the way the website does.

## What it does

| Step | Where |
|---|---|
| First use: download zai-openai-proxy at a pinned commit into `upstream/` and `npm install` it | [`setup.sh`](setup.sh) |
| Start the proxy on `127.0.0.1:39876`, only reachable from this Mac | [`start.sh`](start.sh), [`localhost-only.cjs`](localhost-only.cjs) |
| Tell Anvil where it is, its models, and to turn off the slow "thinking" mode | [`anvil-provider.json`](anvil-provider.json) |

Your prompts go from Anvil to the proxy on your Mac, and from there to chat.z.ai. The setup and server log is in the plugin folder (`.anvil-server.log`); Settings links to it.

## Good to know

- This uses chat.z.ai's website through an unofficial proxy, not Z.ai's API. It can break whenever the site changes (as it has right now), guest sessions are rate-limited, and it may go against Z.ai's terms.
- The upstream proxy starts its headless Chrome with `--no-sandbox`. That's its choice, not this plugin's.
- zai-openai-proxy has no license file (its `package.json` says MIT), so this plugin doesn't copy it: `setup.sh` downloads it on your Mac.

## License

The plugin's own files are MIT. zai-openai-proxy is by [xaoLiu1222](https://github.com/xaoLiu1222), under its own terms.
