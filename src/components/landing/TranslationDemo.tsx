import { LANG_SHORT } from "@/lib/lang";
import type { Lang } from "@/lib/types";
import { DEMO_SENTENCES } from "@/i18n/landing";
import "./landing.css";

const TARGETS: { lang: Lang; cls: string }[] = [
  { lang: "zh", cls: "ld-b1" },
  { lang: "en", cls: "ld-b2" },
  { lang: "ru", cls: "ld-b3" },
];

/** CSS-only product demo: one Kazakh sentence turning into Chinese, English and Russian. */
export function TranslationDemo({ label, mic }: { label: string; mic: string }) {
  return (
    <figure className="m-0" aria-label={label}>
      <div className="relative rounded-[var(--radius-card)] bg-ink p-4 text-paper sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay text-paper">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-paper/60">
              {mic}, {LANG_SHORT.kk}
            </p>
            <p lang="kk" className="text-lg font-semibold leading-snug sm:text-xl">
              {DEMO_SENTENCES.kk}
            </p>
          </div>
          <span className="ld-wave flex h-6 items-center gap-1" aria-hidden>
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
        </div>

        <svg viewBox="0 0 200 22" className="my-1 h-5 w-full text-dune" preserveAspectRatio="none" aria-hidden>
          <path d="M100 0 V8 M100 8 H30 V22 M100 8 V22 M100 8 H170 V22" className="ld-flow" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>

        <ul className="m-0 grid list-none gap-2 p-0">
          {TARGETS.map(({ lang, cls }) => (
            <li key={lang} className={`ld-bubble ${cls} flex items-start gap-3 rounded-[var(--radius-card)] bg-paper p-3 text-ink`}>
              <span className="chip mt-0.5 shrink-0">{LANG_SHORT[lang]}</span>
              <span lang={lang === "zh" ? "zh-CN" : lang} className="text-base font-medium leading-snug">
                {DEMO_SENTENCES[lang]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
