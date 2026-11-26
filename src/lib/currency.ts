import type { Lang } from "./types";

export type Currency = "KZT" | "CNY" | "USD" | "EUR" | "RUB";

/**
 * Approximate tenge per unit, fixed for the MVP. Replace with a daily rate feed before launch.
 * RATES_AS_OF is shown next to converted prices.
 */
export const KZT_PER: Record<Currency, number> = {
  KZT: 1,
  CNY: 66.7,
  USD: 480,
  EUR: 520,
  RUB: 5.9,
};
export const RATES_AS_OF = "2026-11-26";

export const DEFAULT_CURRENCY: Record<Lang, Currency> = {
  kk: "KZT",
  ru: "KZT",
  en: "USD",
  zh: "CNY",
};

const SYMBOL: Record<Currency, string> = { KZT: "₸", CNY: "元", USD: "$", EUR: "€", RUB: "₽" };

export function convert(kzt: number, to: Currency): number {
  return kzt / KZT_PER[to];
}

function group(n: number, sep: string) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** "15 000 ₸" */
export function formatKzt(kzt: number): string {
  return `${group(kzt, " ")} ₸`;
}

/** Price in the given currency: "≈ 225 元", "≈ $31". */
export function formatIn(kzt: number, currency: Currency): string {
  if (currency === "KZT") return formatKzt(kzt);
  const v = convert(kzt, currency);
  const rounded = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
  const num = group(rounded, ",");
  if (currency === "USD" || currency === "EUR") return `≈ ${SYMBOL[currency]}${num}`;
  return `≈ ${num} ${SYMBOL[currency]}`;
}

/** Tenge with the visitor's currency in brackets when it differs. */
export function formatDual(kzt: number, lang: Lang): string {
  const cur = DEFAULT_CURRENCY[lang];
  if (cur === "KZT") return formatKzt(kzt);
  return `${formatIn(kzt, cur)} · ${formatKzt(kzt)}`;
}
