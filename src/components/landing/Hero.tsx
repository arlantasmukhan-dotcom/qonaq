import Image from "next/image";
import Link from "next/link";
import { LangSwitcher } from "@/components/LangSwitcher";
import type { LandingCopy } from "@/i18n/landing";
import type { Lang } from "@/lib/types";
import { Wordmark } from "./Wordmark";
import "./landing.css";

/** Full-bleed photo hero: the land itself first, the words on top of it. */
export function Hero({ lang, t }: { lang: Lang; t: LandingCopy }) {
  const host = (
    <Link key="host" href="/new" className="btn btn-xl hero-ghost w-full sm:w-auto">
      {t.hostCta}
    </Link>
  );
  const traveler = (
    <Link key="traveler" href="/saty" className="btn btn-accent btn-xl w-full sm:w-auto">
      {t.travelerCta}
    </Link>
  );
  // Hosts read ru/kk, tourists read en/zh: lead with the audience of the visitor's language.
  const ctas = lang === "ru" || lang === "kk" ? [host, traveler] : [traveler, host];

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col text-paper">
      <Image
        src="/art/photo/bozzhyra.jpg"
        alt={t.heroPhotoAlt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[50%_40%]"
      />
      <div aria-hidden className="hero-shade absolute inset-0 -z-10" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
        <Wordmark tone="light" />
        <LangSwitcher current={lang} tone="dark" />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-8 pt-24 sm:px-6 sm:pb-14">
        <h1 className="animate-rise max-w-[16ch] text-[2.75rem] leading-[1.02] sm:text-7xl lg:text-[5.5rem]">{t.headline}</h1>
        <p className="animate-rise mt-5 max-w-xl text-base leading-relaxed text-paper/85 sm:text-lg" style={{ animationDelay: "80ms" }}>
          {t.sub}
        </p>
        <div className="animate-rise mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ animationDelay: "160ms" }}>
          {ctas}
        </div>
        <p className="mt-8 self-end text-xs text-paper/70">{t.heroPhotoPlace}</p>
      </div>
    </section>
  );
}
