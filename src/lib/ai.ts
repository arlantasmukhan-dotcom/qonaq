import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { EXTRA_KINDS, type Lang } from "./types";

const MODEL = process.env.QONAQ_MODEL || "claude-opus-5-5";
// Fast mode makes the 15-second card possible on stage. Set QONAQ_FAST=0 to turn it off.
const FAST = process.env.QONAQ_FAST !== "0";

let client: Anthropic | null = null;
/**
 * Runs a request in fast mode when allowed, and in standard mode when fast mode is rate-limited.
 * Some accounts have no fast-mode quota at all (a 429 on every fast request), so after one such
 * 429 the server stays on standard mode for 10 minutes instead of paying the extra round trip.
 */
let fastBlockedUntil = 0;
async function withFastFallback<T>(run: (fast: boolean) => Promise<T>): Promise<T> {
  if (!FAST || Date.now() < fastBlockedUntil) return run(false);
  try {
    return await run(true);
  } catch (err) {
    if (!(err instanceof Anthropic.RateLimitError)) throw err;
    fastBlockedUntil = Date.now() + 10 * 60_000;
    console.warn("[ai] fast mode rate-limited, using standard mode for 10 min");
    return run(false);
  }
}

function getClient() {
  client ??= new Anthropic({ timeout: 45_000, maxRetries: 1 });
  return client;
}

export class AiError extends Error {
  constructor(
    message: string,
    public readonly kind: "no_key" | "refused" | "failed",
  ) {
    super(message);
  }
}

const localized = z.object({ kk: z.string(), ru: z.string(), en: z.string(), zh: z.string() });

const ListingDraftSchema = z.object({
  hostName: z.string().nullable(),
  hostNames: localized.nullable(),
  villageSlug: z.string().nullable(),
  villageName: localized.nullable(),
  rooms: z.number().int().nullable(),
  priceKzt: z.number().int().nullable(),
  priceGuests: z.number().int().nullable(),
  breakfastIncluded: z.boolean().nullable(),
  checkIn: z.string().nullable(),
  extras: z.array(
    z.object({
      kind: z.enum(EXTRA_KINDS),
      priceKzt: z.number().int().nullable(),
      name: localized,
    }),
  ),
  content: z.object({
    kk: z.object({ title: z.string(), description: z.string(), rules: z.string() }),
    ru: z.object({ title: z.string(), description: z.string(), rules: z.string() }),
    en: z.object({ title: z.string(), description: z.string(), rules: z.string() }),
    zh: z.object({ title: z.string(), description: z.string(), rules: z.string() }),
  }),
  missing: z.array(z.string()),
});
export type ListingDraft = z.infer<typeof ListingDraftSchema>;

const GLOSSARY = `Place names (use these exact forms):
- Саты / Saty → kk "Саты", en "Saty", zh "萨特村"
- Кольсай / Колсай / Қолсай → en "Kolsai Lakes", zh "科尔赛湖"
- Каинды / Қайыңды → en "Kaindy Lake", zh "凯恩迪湖"
- Кеген → en "Kegen", zh "凯根"
- Боровое / Бурабай → en "Burabay", zh "布拉拜"
- Алматы → en "Almaty", zh "阿拉木图"
- баня / монша → en "Russian-style sauna (banya)", zh "俄式桑拿浴"
- тенге / теңге → en "tenge (₸)", zh "坚戈"`;

const LISTING_SYSTEM = `You turn a rural guesthouse host's spoken description (Kazakh or Russian, transcribed by a phone, may have recognition errors) into a listing card for foreign tourists.

Rules:
- Use only facts the host said. Never invent amenities, distances, views or prices. If something is not said, use null and add the field name to "missing".
- Numbers spoken as words become integers: "он бес мың" / "пятнадцать тысяч" → 15000. Prices are in tenge.
- priceKzt is the price per night for the room as described; priceGuests is how many people that price covers.
- checkIn is "HH:MM" 24h ("после двух" / "екіден кейін" → "14:00").
- extras: paid or free extra services the host offers (sauna/banya, car or transfer, meals, horses, guide).
- hostNames: the host's name written for each language (kk/ru Cyrillic as said, en Latin transliteration, zh standard Chinese transliteration, e.g. Ерлан → 叶尔兰).
- villageSlug: lowercase latin slug of the village (e.g. "saty", "burabay"); villageName in all four languages.
- content: for each language a title, a 2–3 sentence description and the house rules line ("" if none said).
  - title: "<Host name>'s guesthouse in <village>" style, natural in each language (zh e.g. "叶尔兰之家 · 萨特村").
  - Warm and plain. No exclamation marks, no superlatives, no emoji.
  - kk is Kazakh in Cyrillic; zh is Simplified Chinese; prices inside text use tenge.
${GLOSSARY}`;

/**
 * Test stand-in for local UI checks without an API key: QONAQ_AI_MOCK=1 in .env.local.
 * Never active in production builds. Output is visibly marked "ТЕСТ" so it can't pass for real AI.
 */
const MOCK = process.env.QONAQ_AI_MOCK === "1" && process.env.NODE_ENV !== "production";

function mockDraft(text: string, villageHint?: string): ListingDraft {
  const num = (re: RegExp) => {
    const m = text.match(re);
    return m ? Number(m[1].replace(/\s/g, "")) : null;
  };
  const rooms = num(/(\d+)\s*(?:комнат|бөлме)/i);
  const thousands = num(/(\d+)\s*(?:тысяч|мың)/i);
  const price = thousands ? thousands * 1000 : num(/(\d[\d\s]{3,})\s*(?:тенге|теңге|₸)/i);
  const name = text.match(/(?:зовут|атым)\s+([А-ЯЁӘҒҚҢӨҰҮҺІ][а-яёәғқңөұүһі]+)/)?.[1] ?? null;
  const village = villageHint || "Саты";
  const mark = (s: string) => `ТЕСТ · ${s}`;
  const t = (title: string) => ({ title: mark(title), description: mark(text.slice(0, 200)), rules: "" });
  return {
    hostName: name,
    hostNames: name ? { kk: name, ru: name, en: name, zh: name } : null,
    villageSlug: null,
    villageName: { kk: village, ru: village, en: village, zh: village },
    rooms,
    priceKzt: price,
    priceGuests: price ? 2 : null,
    breakfastIncluded: /завтрак|таңғы ас/i.test(text) ? true : null,
    checkIn: null,
    extras: /баня|монша/i.test(text)
      ? [{ kind: "sauna", priceKzt: null, name: { kk: "Монша", ru: "Баня", en: "Banya", zh: "俄式桑拿浴" } }]
      : [],
    content: { kk: t(`${name ?? "Қонақ"} үйі`), ru: t(`Дом ${name ?? "хозяина"}`), en: t("Guesthouse"), zh: t("民宿") },
    missing: ["checkIn", ...(rooms ? [] : ["rooms"]), ...(price ? [] : ["priceKzt"])],
  };
}

/** Spoken or typed host description → structured card in kk/ru/en/zh. */
export async function draftListing(input: { text: string; lang: Lang; villageHint?: string }): Promise<ListingDraft> {
  if (MOCK) return mockDraft(input.text, input.villageHint);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    throw new AiError("ANTHROPIC_API_KEY is not set", "no_key");
  }
  // The spoken words win: the form field is only a fallback when the host names no village aloud.
  const hint = input.villageHint
    ? `\nThe host also typed the village "${input.villageHint}" in a form field. If their words above name a village, use the spoken one; use the typed one only when the words name none.`
    : "";
  try {
    const response = await withFastFallback((fast) => getClient().beta.messages.parse(
      {
      model: MODEL,
      max_tokens: 6000,
      ...(fast ? { speed: "fast" as const } : {}),
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(ListingDraftSchema) },
      system: LISTING_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Host's words (${input.lang === "kk" ? "Kazakh" : "Russian"}):\n"""${input.text.slice(0, 4000)}"""${hint}`,
        },
      ],
      },
      { maxRetries: 0, timeout: 50_000 },
    ));
    if (response.stop_reason === "refusal") throw new AiError("refused", "refused");
    if (!response.parsed_output) throw new AiError(`no parsed output (stop: ${response.stop_reason})`, "failed");
    return response.parsed_output;
  } catch (err) {
    if (err instanceof AiError) throw err;
    throw new AiError(describe(err), "failed");
  }
}

const TranslationSchema = z.object({
  detectedLang: z.enum(["kk", "ru", "en", "zh", "other"]),
  translations: localized,
});
export type Translation = z.infer<typeof TranslationSchema>;

const TRANSLATE_SYSTEM = `You translate short messages between a foreign tourist and a rural guesthouse host in Kazakhstan.
Return the message in Kazakh (Cyrillic), Russian, English and Simplified Chinese.
Keep the meaning, tone and every number, date and price exactly. Do not add greetings or anything that was not said.
Detect the language of the original; if it is one of kk/ru/en/zh, copy the original unchanged into that slot.
${GLOSSARY}`;

/** Short message → all four languages. Used for guest questions and host replies. */
export async function translateMessage(text: string, context?: string): Promise<Translation> {
  if (MOCK) {
    const detectedLang = /[一-鿿]/.test(text) ? "zh" : /[а-яё]/i.test(text) ? "ru" : "en";
    const tag = (l: string) => (l === detectedLang ? text : `ТЕСТ ${l}: ${text}`);
    return { detectedLang, translations: { kk: tag("kk"), ru: tag("ru"), en: tag("en"), zh: tag("zh") } };
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    throw new AiError("ANTHROPIC_API_KEY is not set", "no_key");
  }
  try {
    // One attempt within 22 s: the routes that translate stop at 30 s on serverless hosts, and a clean
    // "AI failed" reply beats the platform cutting the request mid-call.
    const response = await withFastFallback((fast) => getClient().beta.messages.parse(
      {
      model: MODEL,
      max_tokens: 2000,
      ...(fast ? { speed: "fast" as const } : {}),
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(TranslationSchema) },
      system: TRANSLATE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${context ? `Context: ${context}\n` : ""}Message:\n"""${text.slice(0, 2000)}"""`,
        },
      ],
      },
      { maxRetries: 0, timeout: 22_000 },
    ));
    if (response.stop_reason === "refusal") throw new AiError("refused", "refused");
    if (!response.parsed_output) throw new AiError(`no parsed output (stop: ${response.stop_reason})`, "failed");
    return response.parsed_output;
  } catch (err) {
    if (err instanceof AiError) throw err;
    throw new AiError(describe(err), "failed");
  }
}

function describe(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "Invalid Anthropic API key";
  if (err instanceof Anthropic.RateLimitError) return "Rate limited by Anthropic API";
  if (err instanceof Anthropic.APIError) return `Anthropic API error ${err.status}: ${err.message}`;
  return err instanceof Error ? err.message : String(err);
}
