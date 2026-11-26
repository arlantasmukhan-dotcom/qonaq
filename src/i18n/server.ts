import "server-only";
import { cookies, headers } from "next/headers";
import { isLang, LANG_COOKIE, langFromAcceptLanguage } from "@/lib/lang";
import type { Lang } from "@/lib/types";

/**
 * Visitor language: ?lang= is handled by the switcher (it sets the cookie), then the cookie,
 * then the browser's Accept-Language. Hosts default to Russian, tourists to English.
 */
export async function getLang(fallback: Lang = "en"): Promise<Lang> {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(c)) return c;
  return langFromAcceptLanguage((await headers()).get("accept-language"), fallback);
}

/** Host-facing pages: only Kazakh or Russian. */
export async function getHostLang(): Promise<"kk" | "ru"> {
  const lang = await getLang("ru");
  return lang === "kk" ? "kk" : "ru";
}
