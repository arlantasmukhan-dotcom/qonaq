/**
 * WhatsApp number as wa.me wants it: digits only, with the country code.
 * Kazakh habits are normalised: "8 701 …" and "701 …" (10 digits, no code) both become "7701…".
 * Returns null when the result cannot be a phone number.
 */
export function normalizeWhatsapp(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (/^87\d{9}$/.test(d)) d = `7${d.slice(1)}`;
  else if (/^7\d{9}$/.test(d)) d = `7${d}`; // "701 123 45 67": local mobile without the country code
  return d.length >= 11 && d.length <= 15 ? d : null;
}
