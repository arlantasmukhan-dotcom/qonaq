import Link from "next/link";
import { LangSwitcher } from "@/components/LangSwitcher";
import type { Lang } from "@/lib/types";

/** Slim top bar: back link (or logo) on the left, language switcher on the right. */
export function TouristHeader({
  lang,
  backHref,
  backLabel,
  tone = "light",
}: {
  lang: Lang;
  backHref?: string;
  backLabel?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      {backHref ? (
        <Link
          href={backHref}
          className={`inline-flex min-h-12 items-center gap-1 pr-3 text-sm font-bold ${
            tone === "dark" ? "text-white" : "text-teal"
          }`}
        >
          <span aria-hidden className="text-lg leading-none">
            ‹
          </span>
          {backLabel}
        </Link>
      ) : (
        <Link href="/" className="inline-flex min-h-12 items-center text-lg font-extrabold tracking-tight text-teal">
          Qonaq
        </Link>
      )}
      <LangSwitcher current={lang} tone={tone} />
    </div>
  );
}
