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

s = s.replace("  await page.evaluate(() => localStorage.removeItem('token'));",
  "  await page.evaluate((t) => { if (t) localStorage.setItem('token', t); else localStorage.removeItem('token'); }, ANVIL_ACCOUNT_TOKEN);");
fs.writeFileSync('upstream/zai-proxy.js', s);
console.log('proxy patched for account sessions');
