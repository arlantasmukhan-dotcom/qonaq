import { randomBytes, randomInt, randomUUID } from "node:crypto";

// No 0/O, 1/I/L: codes are read aloud and typed from phone screens.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function randomCode(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/** Public request code, shown in URLs: /r/7F3K2M */
export const requestCode = () => randomCode(6);
/** Secret that lets the host answer a request. */
export const hostKey = () => randomCode(10);
/** Secret that lets the host edit a listing. */
export const editToken = () => randomBytes(18).toString("base64url");
export const newId = () => randomUUID();

const TRANSLIT: Record<string, string> = {
  а: "a", ә: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
  к: "k", қ: "k", л: "l", м: "m", н: "n", ң: "n", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ұ: "u", ү: "u", ф: "f", х: "kh", һ: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", і: "i",
  ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  const latin = input
    .toLowerCase()
    .split("")
    .map((c) => TRANSLIT[c] ?? c)
    .join("");
  return latin
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
