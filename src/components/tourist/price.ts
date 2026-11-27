import { DEFAULT_CURRENCY, formatIn, formatKzt } from "@/lib/currency";
import type { Lang } from "@/lib/types";

/** Big price in the visitor's currency, small price in tenge (null when the visitor already sees tenge). */
export function priceParts(kzt: number, lang: Lang): { big: string; small: string | null } {
  const cur = DEFAULT_CURRENCY[lang];
  if (cur === "KZT") return { big: formatKzt(kzt), small: null };
  return { big: formatIn(kzt, cur), small: formatKzt(kzt) };
}

/** Rooms needed for a party, mirroring the server's total calculation. */
export function roomsFor(guests: number, priceGuests: number | null): number {
  return priceGuests ? Math.max(1, Math.ceil(guests / priceGuests)) : 1;
}

/** Most guests the house can take: rooms × guests per room when both are known, else the form's own cap. */
export function maxGuests(rooms: number | null, priceGuests: number | null, cap = 12): number {
  return rooms && priceGuests ? Math.max(1, Math.min(cap, rooms * priceGuests)) : cap;
}
