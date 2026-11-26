import type { Lang, LiveEvent, Localized } from "@/lib/types";
import { isLang } from "@/lib/lang";

export interface RequestView {
  kind: "request";
  id: number;
  guestName: string;
  guestLang: Lang;
  listingTitle: string;
  question: string | null;
  questionRu: string | null;
  nights: number;
  guests: number;
}

export interface ReplyView {
  kind: "reply";
  id: number;
  hostName: string;
  action: "available" | "busy" | "car" | null;
  original: string;
  translated: string;
  guestLang: Lang;
}

export interface ListingView {
  kind: "listing";
  id: number;
  titles: Localized;
  villages: Localized;
  priceKzt: number | null;
  photoId: string | null;
}

export type EventView = RequestView | ReplyView | ListingView;

type Rec = Record<string, unknown>;

function rec(v: unknown): Rec | null {
  return typeof v === "object" && v !== null ? (v as Rec) : null;
}
function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function num(v: unknown, d = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : d;
}

const ORDER: Lang[] = ["ru", "en", "zh", "kk"];

/** listing_created carries {kk,ru,en,zh} of {title,...}; request_created carries the same. Tolerate plain strings. */
function titleOf(v: unknown, lang: Lang): string {
  const s = str(v);
  if (s) return s;
  const r = rec(v);
  if (!r) return "";
  for (const l of [lang, ...ORDER]) {
    const entry = rec(r[l]);
    const t = entry ? str(entry.title) : str(r[l]);
    if (t) return t;
  }
  return "";
}

function localized(v: unknown, pick: (x: unknown) => string | null): Localized {
  const r = rec(v);
  const out = {} as Localized;
  for (const l of ORDER) out[l] = (r && pick(r[l])) || "";
  const first = ORDER.map((l) => out[l]).find(Boolean) ?? "";
  for (const l of ORDER) if (!out[l]) out[l] = first;
  return out;
}

export function toView(e: LiveEvent): EventView | null {
  const p = e.payload;
  if (e.type === "request_created") {
    const gl = isLang(p.guestLang) ? p.guestLang : "en";
    return {
      kind: "request",
      id: e.id,
      guestName: str(p.guestName) ?? "Guest",
      guestLang: gl,
      listingTitle: titleOf(p.listingTitle, "ru"),
      question: str(p.question),
      questionRu: str(p.questionRu),
      nights: num(p.nights, 1),
      guests: num(p.guests, 1),
    };
  }
  if (e.type === "host_replied") {
    const a = p.action;
    return {
      kind: "reply",
      id: e.id,
      hostName: str(p.hostName) ?? "",
      action: a === "available" || a === "busy" || a === "car" ? a : null,
      original: str(p.original) ?? "",
      translated: str(p.translated) ?? "",
      guestLang: isLang(p.guestLang) ? p.guestLang : "en",
    };
  }
  if (e.type === "listing_created") {
    return {
      kind: "listing",
      id: e.id,
      titles: localized(p.title, (x) => str(rec(x)?.title)),
      villages: localized(p.village, str),
      priceKzt: typeof p.priceKzt === "number" ? p.priceKzt : null,
      photoId: str(p.photoId),
    };
  }
  return null;
}

/** Shown when a request has no free-text question: a structured summary in each language. */
export function summary(lang: Lang, guests: number, nights: number): string {
  switch (lang) {
    case "zh":
      return `${guests} 位客人 · ${nights} 晚`;
    case "kk":
      return `Қонақ: ${guests} · түн: ${nights}`;
    case "ru":
      return `Гостей: ${guests} · ночей: ${nights}`;
    default:
      return `Guests: ${guests} · nights: ${nights}`;
  }
}

export const ACTION_LABEL: Record<"available" | "busy" | "car", string> = {
  available: "Свободно",
  busy: "Занято",
  car: "Машина есть",
};

export const FLAG: Record<Lang, string> = { kk: "KZ", ru: "RU", en: "EN", zh: "CN" };
export const LANG_FULL_RU: Record<Lang, string> = { kk: "Казахстан", ru: "Россия", en: "English", zh: "Китай" };
