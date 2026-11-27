"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { LANG_COOKIE, LANG_SHORT } from "@/lib/lang";
import { LANGS, type Lang } from "@/lib/types";

function saveLangCookie(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Compact language switcher. By default stores the choice in a cookie and re-renders the page.
 * `via="query"` keeps the choice on this page only (?lang=xx), e.g. the guest's request page,
 * so a host on the same phone does not change the guest's language.
 */
export function LangSwitcher({
  current,
  langs = LANGS,
  tone = "light",
  via = "cookie",
}: {
  current: Lang;
  langs?: readonly Lang[];
  tone?: "light" | "dark";
  via?: "cookie" | "query";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [pending, start] = useTransition();

  function pick(lang: Lang) {
    if (via === "query") {
      const q = new URLSearchParams(search.toString());
      q.set("lang", lang);
      start(() => router.replace(`${pathname}?${q.toString()}`, { scroll: false }));
      return;
    }
    saveLangCookie(lang);
    start(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-full p-1 text-xs font-bold ${
        tone === "dark" ? "bg-ink/30 text-paper backdrop-blur-sm" : "bg-paper border border-line text-muted"
      } ${pending ? "opacity-60" : ""}`}
    >
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={l === current}
          className={`min-w-11 whitespace-nowrap rounded-full px-2.5 py-1.5 transition-colors ${
            l === current ? (tone === "dark" ? "bg-paper text-ink" : "bg-ink text-paper") : ""
          }`}
        >
          {LANG_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
