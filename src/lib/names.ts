import type { Lang, Listing } from "./types";

/** Host's first name in the visitor's language (叶尔兰 for Ерлан), falling back to the original. */
export function hostNameIn(listing: Pick<Listing, "hostName" | "hostNames">, lang: Lang): string {
  const name = listing.hostNames?.[lang]?.trim() || listing.hostName.trim();
  return lang === "zh" ? name : (name.split(/\s+/)[0] ?? name);
}
