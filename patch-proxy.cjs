// Lets zai-openai-proxy use the owner's signed-in session instead of a guest.
// Anvil passes the token as ZAI_TOKEN and cookies as ANVIL_PROVIDER_COOKIES.
const fs = require('fs');
let s = fs.readFileSync('upstream/zai-proxy.js', 'utf8');
if (s.includes('ANVIL_ACCOUNT_TOKEN')) { console.log('proxy already patched'); process.exit(0); }

const anchor = "const PORT = process.env.PORT || 9876;";
if (!s.includes(anchor)) throw new Error('zai-proxy.js changed: port line not found');
s = s.replace(anchor, anchor + `
const ANVIL_ACCOUNT_TOKEN = process.env.ZAI_TOKEN || '';
const ANVIL_PROFILE = process.env.ZAI_PROFILE || '';
let ANVIL_COOKIES = {};
try { ANVIL_COOKIES = JSON.parse(process.env.ANVIL_PROVIDER_COOKIES || '{}'); } catch {}`);

const decl = "let browser, page;";
if (!s.includes(decl)) throw new Error('zai-proxy.js changed: browser declaration not found');
s = s.replace(decl, decl + `

async function loadSignatureModule() {
  await page.evaluate(async (cdnBase) => {
    const modSrc = [...document.scripts].map((x) => x.src).find((u) => /\\/assets\\/index-.*\\.js$/.test(u));
    window.__zaiMod = await import(modSrc || (cdnBase + 'CAm9rDEa.js'));
    const pickFn = (m, ...names) => names.map((n) => m[n]).find((x) => typeof x === 'function');
    window.__zaiYM = pickFn(window.__zaiMod, 'kn', 'b0');
    window.__zaiMM = pickFn(window.__zaiMod, 'ko', 'b1', 'b2');
  }, CDN_BASE);
}`);

const launch = `    executablePath: CHROME_PATH,
    headless: 'new',`;
s = s.replace(launch, `    executablePath: CHROME_PATH,
    userDataDir: ANVIL_PROFILE || undefined,
    headless: 'new',`);

const pageLine = "  page = await browser.newPage();";
s = s.replace(pageLine, `  page = await browser.newPage();
  for (const [name, value] of Object.entries(ANVIL_COOKIES)) {
    try { await page.setCookie({ name, value, domain: '.z.ai', path: '/' }); } catch {}
  }`);

const goto = "  await page.goto(ZAI_BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });";
s = s.replace(goto, goto + `
  if (ANVIL_ACCOUNT_TOKEN) {
    await page.evaluate((t) => localStorage.setItem('token', t), ANVIL_ACCOUNT_TOKEN);
    await page.reload({ waitUntil: 'networkidle2' });
  }`);

s = s.split("window.__zaiMod = await import(cdnBase + 'CAm9rDEa.js');").join(
  "const modSrc = [...document.scripts].map((x) => x.src).find((u) => /\\/assets\\/index-.*\\.js$/.test(u));\n" +
  "    window.__zaiMod = await import(modSrc || (cdnBase + 'CAm9rDEa.js'));\n" +
  "    const pickFn = (m, ...names) => names.map((n) => m[n]).find((x) => typeof x === 'function');\n" +
  "    window.__zaiYM = pickFn(window.__zaiMod, 'kn', 'b0');\n" +
  "    window.__zaiMM = pickFn(window.__zaiMod, 'ko', 'b1', 'b2');");

s = s.split("    window.__zaiYM = window.__zaiMod.b0;\n    window.__zaiMM = window.__zaiMod.b1;\n").join("");

s = s.replace("  console.log('[+] Page loaded');", "  console.log('[+] Page loaded', await page.evaluate(() => ({ ym: typeof window.__zaiYM, mm: typeof window.__zaiMM })));");
s = s.replace("  console.log('[+] Signature module loaded');", "  console.log('[+] Signature module loaded', await page.evaluate(() => ({ ym: typeof window.__zaiYM, mm: typeof window.__zaiMM })));");

s = s.replace("  await page.evaluate(() => localStorage.removeItem('token'));",
  "  await page.evaluate((t) => { if (t) localStorage.setItem('token', t); else localStorage.removeItem('token'); }, ANVIL_ACCOUNT_TOKEN);");
// Collapse the inlined module loaders into the shared helper.
const inline = `  await page.evaluate(async (cdnBase) => {\n    const modSrc = [...document.scripts].map((x) => x.src).find((u) => /\\/assets\\/index-.*\\.js$/.test(u));\n    window.__zaiMod = await import(modSrc || (cdnBase + 'CAm9rDEa.js'));\n    const pickFn = (m, ...names) => names.map((n) => m[n]).find((x) => typeof x === 'function');\n    window.__zaiYM = pickFn(window.__zaiMod, 'kn', 'b0');\n    window.__zaiMM = pickFn(window.__zaiMod, 'ko', 'b1', 'b2');\n  }, CDN_BASE);`;
s = s.split(inline).join('  await loadSignatureModule();');
s = s.replace("async function generateSignedRequest(model, messages, stream, opts = {}) {\n", "async function generateSignedRequest(model, messages, stream, opts = {}) {\n  await loadSignatureModule();\n");


const brokenHelper = "async function loadSignatureModule() {" + "\n  await loadSignatureModule();\n}";
const helperBody = "async function loadSignatureModule() {\n  await page.evaluate(async (cdnBase) => {\n    const modSrc = [...document.scripts].map((x) => x.src).find((u) => /\\/assets\\/index-.*\\.js$/.test(u));\n    window.__zaiMod = await import(modSrc || (cdnBase + 'CAm9rDEa.js'));\n    const pickFn = (m, ...names) => names.map((n) => m[n]).find((x) => typeof x === 'function');\n    window.__zaiYM = pickFn(window.__zaiMod, 'kn', 'b0');\n    window.__zaiMM = pickFn(window.__zaiMod, 'ko', 'b1', 'b2');\n  }, CDN_BASE);\n}";
s = s.split(brokenHelper).join(helperBody);

fs.writeFileSync('upstream/zai-proxy.js', s);
console.log('proxy patched for account sessions');
