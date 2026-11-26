import Link from "next/link";
import type { LandingCopy } from "@/i18n/landing";
import type { Lang } from "@/lib/types";
import { TranslationDemo } from "./TranslationDemo";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Hero({ lang, t }: { lang: Lang; t: LandingCopy }) {
  const host = (
    <Link key="host" href="/new" className="btn btn-primary btn-xl w-full justify-between text-left sm:w-auto">
      <span>{t.hostCta}</span>
      <Arrow />
    </Link>
  );
  const traveler = (
    <Link key="traveler" href="/saty" className="btn btn-accent btn-xl w-full justify-between text-left sm:w-auto">
      <span>{t.travelerCta}</span>
      <Arrow />
    </Link>
  );
  // Hosts read ru/kk, tourists read en/zh: lead with the audience of the visitor's language.
  const ctas = lang === "ru" || lang === "kk" ? [host, traveler] : [traveler, host];

  return (
    <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="animate-rise">
        <span className="chip">{t.tagline}</span>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">{t.headline}</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{t.sub}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{ctas}</div>
      </div>
      <div className="animate-rise" style={{ animationDelay: "120ms" }}>
        <TranslationDemo label={t.demoLabel} mic={t.demoMic} />
      </div>
    </section>
  );
}
