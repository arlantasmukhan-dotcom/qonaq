import { LANGS, type Lang } from "./types";

export const LANG_LABEL: Record<Lang, string> = {
  kk: "Қазақша",
  ru: "Русский",
  en: "English",
  zh: "中文",
};

export const LANG_SHORT: Record<Lang, string> = { kk: "ҚАЗ", ru: "РУС", en: "ENG", zh: "中文" };

/** Lang names written in each language, for "translated from …" labels. */
export const LANG_NAME_IN: Record<Lang, Record<Lang, string>> = {
  kk: { kk: "қазақ тілі", ru: "орыс тілі", en: "ағылшын тілі", zh: "қытай тілі" },
  ru: { kk: "казахский", ru: "русский", en: "английский", zh: "китайский" },
  en: { kk: "Kazakh", ru: "Russian", en: "English", zh: "Chinese" },
  zh: { kk: "哈萨克语", ru: "俄语", en: "英语", zh: "中文" },
};

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGS as readonly string[]).includes(v);
}

/** Picks the best supported language from an Accept-Language header. */
export function langFromAcceptLanguage(header: string | null | undefined, fallback: Lang = "en"): Lang {
  if (!header) return fallback;
  const parts = header
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    const base = tag.split("-")[0];
    if (isLang(base)) return base;
  }
  return fallback;
}

export const LANG_COOKIE = "qonaq_lang";
