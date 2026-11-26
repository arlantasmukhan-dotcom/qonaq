#!/usr/bin/env node
/**
 * Pre-demo check of a running Qonaq site.
 *
 *   node scripts/smoke.mjs https://your-site.vercel.app          # read-only: pages, QR, live feed
 *   node scripts/smoke.mjs https://your-site.vercel.app --write  # + creates one demo request (shows on /live)
 *   node scripts/smoke.mjs https://your-site.vercel.app --ai     # + AI: card from text, translated question, timings
 *
 * Exit code 0 = everything passed.
 */
const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/$/, "");
const write = args.includes("--write") || args.includes("--ai");
const ai = args.includes("--ai");
const DEMO_LISTING = "0b6f0b8e-0001-4c1a-9a00-5a7e00000001"; // Erlan, Saty (seed)

let failed = 0;
const ok = (name, extra = "") => console.log(`  ✓ ${name}${extra ? `  ${extra}` : ""}`);
const bad = (name, why) => {
  failed++;
  console.log(`  ✗ ${name}  ${why}`);
};

async function timed(fn) {
  const t = performance.now();
  const r = await fn();
  return [r, ((performance.now() - t) / 1000).toFixed(1) + " s"];
}

async function page(path, mustContain, headers = {}) {
  try {
    const [res, took] = await timed(() => fetch(base + path, { headers }));
    const html = await res.text();
    if (res.status !== 200) return bad(path, `HTTP ${res.status}`);
    if (mustContain && !html.includes(mustContain)) return bad(path, `missing "${mustContain}"`);
    ok(path, took);
  } catch (e) {
    bad(path, e.message);
  }
}

async function api(method, path, body) {
  const [res, took] = await timed(() =>
    fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
  const json = await res.json().catch(() => null);
  return { status: res.status, json, took };
}

function nextWeekend() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((5 - d.getUTCDay() + 7) % 7 || 7));
  const from = d.toISOString().slice(0, 10);
  d.setUTCDate(d.getUTCDate() + 2);
  return [from, d.toISOString().slice(0, 10)];
}

console.log(`Qonaq smoke test → ${base}\n`);

console.log("Pages");
await page("/", "Qonaq");
await page("/saty", "Saty", { "Accept-Language": "en" });
await page("/saty/erlan", "联系房东", { "Accept-Language": "zh-CN" });
await page("/saty/erlan/driver", "ауылы");
await page("/new", "WhatsApp", { "Accept-Language": "ru" });
await page("/live", "Qonaq");
await page("/offline");
await page("/manifest.webmanifest", "Qonaq");
await page("/sw.js", "caches");

console.log("\nAPI");
{
  const r = await api("GET", "/api/live");
  if (r.status === 200 && Array.isArray(r.json?.events)) ok("GET /api/live", r.took);
  else bad("GET /api/live", `HTTP ${r.status}`);
  const qr = await fetch(`${base}/api/qr?text=${encodeURIComponent(base + "/saty")}`);
  if (qr.status === 200 && (qr.headers.get("content-type") ?? "").includes("svg")) ok("GET /api/qr");
  else bad("GET /api/qr", `HTTP ${qr.status}`);
}

if (write) {
  console.log("\nBooking (creates a request on the demo house)");
  const [dateFrom, dateTo] = nextWeekend();
  const r = await api("POST", "/api/requests", {
    listingId: DEMO_LISTING,
    guestName: "Smoke test",
    guestLang: "zh",
    guests: 2,
    dateFrom,
    dateTo,
    wantsCar: true,
  });
  if (r.status !== 200) bad("POST /api/requests", `HTTP ${r.status} ${JSON.stringify(r.json?.error)}`);
  else {
    ok("POST /api/requests (car, no AI)", r.took);
    if (r.json.waUrl.startsWith("https://wa.me/")) ok("WhatsApp link");
    else bad("WhatsApp link", r.json.waUrl);
    const g = await api("GET", `/api/requests/${r.json.code}`);
    if (g.status === 200 && g.json?.isHost === false) ok(`GET /api/requests/${r.json.code} (guest)`);
    else bad("request page data", `HTTP ${g.status}`);
  }
}

if (ai) {
  console.log("\nAI (Claude) — the demo's key moment");
  const text =
    "Меня зовут Асель, у меня дом в Боровом, 3 комнаты, ночь 20 тысяч тенге на двоих, завтрак включён, есть баня 5 тысяч, заезд после двух.";
  const d = await api("POST", "/api/listings/draft", { text, lang: "ru", whatsapp: "+7 700 000 00 00", village: "Боровое" });
  if (d.status !== 200) bad("POST /api/listings/draft", `HTTP ${d.status} ${JSON.stringify(d.json?.error)}`);
  else {
    const l = d.json.listing;
    ok("Card from speech", d.took);
    console.log(`      rooms=${l.rooms} price=${l.priceKzt} guests=${l.priceGuests} checkIn=${l.checkIn} village=${l.village}`);
    console.log(`      zh: ${l.content.zh.title} — ${l.content.zh.description}`);
    console.log(`      kk: ${l.content.kk.title}`);
    if (l.content.ru.title.startsWith("ТЕСТ")) bad("Real AI", "QONAQ_AI_MOCK is on — remove it from the server env");
    if (l.rooms !== 3) bad("rooms", `expected 3, got ${l.rooms}`);
    if (l.priceKzt !== 20000) bad("price", `expected 20000, got ${l.priceKzt}`);
    if (l.checkIn !== "14:00") bad("checkIn", `expected 14:00, got ${l.checkIn}`);
    console.log("      (draft only — not published, not in the catalog)");
  }
  const [dateFrom, dateTo] = nextWeekend();
  const q = await api("POST", "/api/requests", {
    listingId: DEMO_LISTING,
    guestName: "Smoke test",
    guestLang: "zh",
    guests: 2,
    dateFrom,
    dateTo,
    question: "你好！可以帮我们安排去科尔赛湖的车吗？",
  });
  if (q.status !== 200) bad("Translated question", `HTTP ${q.status} ${JSON.stringify(q.json?.error)}`);
  else {
    ok("Translated question", q.took);
    const line = decodeURIComponent(q.json.waUrl.split("text=")[1]).split("\n").find((s) => s.startsWith("Вопрос"));
    console.log(`      ${line}`);
  }
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
