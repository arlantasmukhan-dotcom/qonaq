"use client";

import { useEffect, useState } from "react";
import { formatKzt } from "@/lib/currency";
import { LANG_SHORT } from "@/lib/lang";
import { LANGS, type Lang } from "@/lib/types";
import { ACTION_LABEL, summary, type ListingView, type ReplyView, type RequestView } from "./events";
import { Typewriter } from "./Typewriter";
import "./live.css";

const langAttr = (l: Lang) => (l === "zh" ? "zh-CN" : l);

function LangTag({ lang, tone = "light" }: { lang: Lang; tone?: "light" | "saffron" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[0.7em] py-[0.15em] text-[0.55em] font-extrabold tracking-wide ${
        tone === "saffron" ? "bg-saffron text-ink" : "bg-white/15 text-white"
      }`}
    >
      {LANG_SHORT[lang]}
    </span>
  );
}

/** The bridge between two texts: a glowing line with a pill in the middle. */
function Bridge({ from, to }: { from: Lang; to: Lang }) {
  return (
    <div className="my-[0.5em] flex items-center gap-3 text-[0.5em] font-bold text-saffron" aria-hidden>
      <span className={`lv-beam h-[2px] flex-1 rounded`} />
      <span className="rounded-full border border-saffron/50 px-3 py-0.5">
        {LANG_SHORT[from]} → {LANG_SHORT[to]}
      </span>
      <span className={`lv-beam h-[2px] flex-1 rounded`} />
    </div>
  );
}

const SHELL = "rounded-[1.4rem] border border-white/15 bg-white/[0.07] p-[clamp(0.9rem,1.5vw,1.6rem)] backdrop-blur-sm";

export function RequestCard({ ev, fresh }: { ev: RequestView; fresh: boolean }) {
  const original = ev.question ?? summary(ev.guestLang, ev.guests, ev.nights);
  const ru = ev.questionRu ?? summary("ru", ev.guests, ev.nights);
  const bridged = ev.guestLang !== "ru";
  return (
    <article className={`${SHELL} lv-card text-[clamp(1rem,1.9vw,2.2rem)]`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6em] font-bold text-white/70">
        <span className="rounded-full bg-saffron px-3 py-0.5 text-ink">Новая заявка</span>
        <span className="text-white">{ev.guestName}</span>
        <LangTag lang={ev.guestLang} />
        {ev.listingTitle ? <span className="min-w-0 truncate">→ {ev.listingTitle}</span> : null}
      </header>
      <p lang={langAttr(ev.guestLang)} className="mt-[0.5em] text-[1.25em] font-bold leading-snug text-white">
        {original}
      </p>
      {bridged ? <Bridge from={ev.guestLang} to="ru" /> : <div className="h-[0.5em]" />}
      <p lang="ru" className="min-h-[1.4em] text-[1.25em] font-extrabold leading-snug text-saffron">
        <Typewriter text={ru} instant={!fresh} />
      </p>
    </article>
  );
}

const ACTION_TONE = {
  available: "bg-ok text-white",
  busy: "bg-busy text-white",
  car: "bg-saffron text-ink",
} as const;

export function ReplyCard({ ev, fresh }: { ev: ReplyView; fresh: boolean }) {
  const label = ev.action ? ACTION_LABEL[ev.action] : "Ответ";
  const tone = ev.action ? ACTION_TONE[ev.action] : "bg-white text-ink";
  const text = ev.translated || ev.original;
  return (
    <article className={`${SHELL} lv-card text-[clamp(1rem,1.9vw,2.2rem)]`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6em] font-bold text-white/70">
        <span className={`rounded-full px-3 py-0.5 ${tone}`}>{label}</span>
        {ev.hostName ? <span className="text-white">{ev.hostName}</span> : null}
        <span>ответил хозяин</span>
      </header>
      <p lang="ru" className="mt-[0.5em] text-[1.25em] font-bold leading-snug text-white">
        {ev.original}
      </p>
      <Bridge from="ru" to={ev.guestLang} />
      <p lang={langAttr(ev.guestLang)} className="min-h-[1.4em] text-[1.25em] font-extrabold leading-snug text-saffron">
        <Typewriter text={text} instant={!fresh} />
      </p>
    </article>
  );
}

export function ListingCard({ ev }: { ev: ListingView; fresh: boolean }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % LANGS.length), 2400);
    return () => clearInterval(t);
  }, []);
  // Start from Chinese-less order kk -> ru -> en -> zh so the cycle reads as "translated into".
  const lang = LANGS[idx] ?? "kk";
  return (
    <article className={`${SHELL} lv-card flex items-center gap-[clamp(0.8rem,1.4vw,1.5rem)] text-[clamp(1rem,1.9vw,2.2rem)]`}>
      <div className="relative h-[4.6em] w-[4.6em] shrink-0 overflow-hidden rounded-2xl bg-white/10">
        {ev.photoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photo/${ev.photoId}`} alt="" className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icon.svg" alt="" className="h-full w-full object-contain p-3 opacity-80" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-3 text-[0.6em] font-bold text-white/70">
          <span className="rounded-full bg-ok px-3 py-0.5 text-white">Создана страница</span>
          {ev.priceKzt ? <span>{formatKzt(ev.priceKzt)}</span> : null}
        </header>
        <p key={lang} lang={langAttr(lang)} className={`lv-fade mt-[0.3em] flex items-center gap-3 text-[1.15em] font-extrabold leading-tight text-white`}>
          <LangTag lang={lang} tone="saffron" />
          <span className="min-w-0 truncate">{ev.titles[lang]}</span>
        </p>
        <p key={`v-${lang}`} lang={langAttr(lang)} className={`lv-fade mt-[0.15em] truncate text-[0.7em] font-semibold text-white/65`}>
          {ev.villages[lang]}
        </p>
      </div>
    </article>
  );
}
