import { LANG_SHORT } from "@/lib/lang";
import type { Lang } from "@/lib/types";
import { DEMO_SENTENCES } from "@/i18n/landing";
import "./landing.css";

const TARGETS: { lang: Lang; cls: string }[] = [
  { lang: "zh", cls: "ld-b1" },
  { lang: "en", cls: "ld-b2" },
  { lang: "ru", cls: "ld-b3" },
];

/** CSS-only hero visual: one Kazakh sentence turning into Chinese, English and Russian. */
export function TranslationDemo({ label, mic }: { label: string; mic: string }) {
  return (
    <figure className={`ld-float m-0`} aria-label={label}>
      <figcaption className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{label}</figcaption>
      <div className="relative rounded-[1.75rem] bg-teal p-4 text-white shadow-card sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron text-ink">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white/70">
              {mic} · {LANG_SHORT.kk}
            </p>
            <p lang="kk" className="text-lg font-bold leading-snug sm:text-xl">
              {DEMO_SENTENCES.kk}
            </p>
          </div>
          <span className={`ld-wave flex h-6 items-center gap-1`} aria-hidden>
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
        </div>

        <svg viewBox="0 0 200 22" className="my-1 h-5 w-full text-saffron" preserveAspectRatio="none" aria-hidden>
          <path d="M100 0 V8 M100 8 H30 V22 M100 8 V22 M100 8 H170 V22" className={"ld-flow"} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>

        <ul className="m-0 grid list-none gap-2 p-0">
          {TARGETS.map(({ lang, cls }) => (
            <li key={lang} className={`ld-bubble ${cls} flex items-start gap-3 rounded-2xl bg-paper p-3 text-ink`}>
              <span className="chip mt-0.5 shrink-0">{LANG_SHORT[lang]}</span>
              <span lang={lang === "zh" ? "zh-CN" : lang} className="text-base font-semibold leading-snug">
                {DEMO_SENTENCES[lang]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
