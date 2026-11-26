"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LANG_COOKIE, LANG_SHORT } from "@/lib/lang";
import { LANGS, type Lang } from "@/lib/types";

function saveLangCookie(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

/** Compact language switcher. Stores the choice in a cookie and re-renders the page. */
export function LangSwitcher({
  current,
  langs = LANGS,
  tone = "light",
}: {
  current: Lang;
  langs?: readonly Lang[];
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function pick(lang: Lang) {
    saveLangCookie(lang);
    start(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-full p-1 text-xs font-bold ${
        tone === "dark" ? "bg-white/15 text-white" : "bg-paper border border-line text-muted"
      } ${pending ? "opacity-60" : ""}`}
    >
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={l === current}
          className={`min-w-11 rounded-full px-2.5 py-1.5 transition-colors ${
            l === current ? (tone === "dark" ? "bg-white text-teal-dark" : "bg-teal text-white") : ""
          }`}
        >
          {LANG_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
