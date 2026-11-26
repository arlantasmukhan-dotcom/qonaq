import type { Lang, Listing } from "./types";

/** Host's first name in the visitor's language (叶尔兰 for Ерлан), falling back to the original. */
export function hostNameIn(listing: Pick<Listing, "hostName" | "hostNames">, lang: Lang): string {
  const name = listing.hostNames?.[lang]?.trim() || listing.hostName.trim();
  return lang === "zh" ? name : (name.split(/\s+/)[0] ?? name);
}

const FRONT = /[әеіөүиэ]/;
const ANY_VOWEL = /[аәеиоөұүыіэюя]/g;

/**
 * Kazakh genitive of a name: Ерлан → Ерланның, Айгүл → Айгүлдің, Гүлнар → Гүлнардың, Асет → Асеттің.
 * Suffix by the last sound (vowel/м/н/ң → -ның, л/р/й/у/з/ж → -дың, other consonants → -тың),
 * front or back by the last vowel.
 */
export function kkGenitive(name: string): string {
  const word = name.trim();
  if (!word) return word;
  const lower = word.toLowerCase();
  const last = lower[lower.length - 1];
  const vowels = lower.match(ANY_VOWEL);
  const front = vowels ? FRONT.test(vowels[vowels.length - 1]) : false;
  let head: "н" | "д" | "т";
  if (/[аәеиоөұүыіэюя]|[мнң]/.test(last)) head = "н";
  else if (/[лрйузж]/.test(last)) head = "д";
  else head = "т";
  return `${word}${head}${front ? "ің" : "ың"}`;
}
