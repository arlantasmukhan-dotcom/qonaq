"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang, LiveEvent } from "@/lib/types";
import { ListingCard, ReplyCard, RequestCard } from "./EventCards";
import { toView, type EventView } from "./events";
import "./live.css";

interface Feed {
  view: EventView;
  fresh: boolean;
}
interface Counters {
  pages: number;
  requests: number;
  replies: number;
  langs: Lang[];
}

const POLL_MS = 2000;
const MAX_ITEMS = 6;
const OPACITY = [1, 0.92, 0.7, 0.5, 0.32, 0.18];

const GREETINGS: { lang: Lang; text: string; sub: string }[] = [
  { lang: "zh", text: "欢迎光临", sub: "扫描二维码，动态将显示在这里" },
  { lang: "kk", text: "Қош келдіңіз", sub: "QR кодты сканерлеңіз — оқиғалар осында көрінеді" },
  { lang: "en", text: "Welcome", sub: "Scan the QR — events will appear here" },
  { lang: "ru", text: "Добро пожаловать", sub: "Отсканируйте QR — события появятся здесь" },
];

function addLangs(prev: Lang[], more: Lang[]): Lang[] {
  const next = new Set<Lang>(prev);
  for (const l of more) next.add(l);
  return next.size === prev.length ? prev : [...next];
}

function Counter({ value, ru, sub }: { value: number; ru: string; sub: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/[0.06] px-[clamp(0.7rem,1.2vw,1.4rem)] py-[clamp(0.5rem,1vw,1rem)]">
      <p key={value} className={`lv-pop text-[clamp(2rem,4.2vw,5rem)] font-extrabold leading-none tabular-nums text-dune`}>
        {value}
      </p>
      <p className="mt-1 truncate text-[clamp(0.8rem,1.15vw,1.4rem)] font-bold text-white">{ru}</p>
      <p className="truncate text-[clamp(0.65rem,0.9vw,1.1rem)] font-semibold text-white/55">{sub}</p>
    </div>
  );
}

function Empty() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % GREETINGS.length), 2600);
    return () => clearInterval(t);
  }, []);
  const g = GREETINGS[i] ?? GREETINGS[0]!;
  return (
    <div className="grid h-full place-items-center text-center">
      <div key={g.lang} className={"lv-fade"}>
        <p lang={g.lang === "zh" ? "zh-CN" : g.lang} className="text-[clamp(3rem,7.5vw,9rem)] font-extrabold leading-tight text-white">
          {g.text}
        </p>
        <p lang={g.lang === "zh" ? "zh-CN" : g.lang} className="mx-auto mt-3 max-w-[40ch] text-[clamp(1rem,1.7vw,2.2rem)] font-semibold text-dune">
          {g.sub}
        </p>
      </div>
    </div>
  );
}

export function LiveScreen() {
  const [items, setItems] = useState<Feed[]>([]);
  const [counters, setCounters] = useState<Counters>({ pages: 0, requests: 0, replies: 0, langs: [] });
  const [connected, setConnected] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const lastId = useRef(0);
  const seeded = useRef(false);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      const ctrl = new AbortController();
      const abort = setTimeout(() => ctrl.abort(), 4000);
      try {
        const res = await fetch(`/api/live?after=${lastId.current}`, { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { events?: LiveEvent[] };
        if (stopped) return;
        const fresh = seeded.current;
        const incoming = (data.events ?? []).filter((e) => e.id > lastId.current).sort((a, b) => a.id - b.id);
        if (incoming.length) {
          lastId.current = incoming[incoming.length - 1]!.id;
          const views = incoming.map(toView).filter((v): v is EventView => v !== null);
          if (views.length) {
            setItems((prev) => [...views.reverse().map((view) => ({ view, fresh })), ...prev].slice(0, MAX_ITEMS));
            setCounters((c) => {
              let { pages, requests, replies } = c;
              let langs = c.langs;
              for (const v of views) {
                if (v.kind === "listing") {
                  pages++;
                  langs = addLangs(langs, ["kk", "ru", "en", "zh"]);
                } else if (v.kind === "request") {
                  requests++;
                  langs = addLangs(langs, [v.guestLang, "ru"]);
                } else {
                  replies++;
                  langs = addLangs(langs, [v.guestLang, "ru"]);
                }
              }
              return { pages, requests, replies, langs };
            });
          }
        }
        seeded.current = true;
        setLoaded(true);
        setConnected(true);
      } catch {
        if (!stopped) setConnected(false);
      } finally {
        clearTimeout(abort);
        if (!stopped) timer = setTimeout(tick, POLL_MS);
      }
    }
    void tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const shown = items;

  return (
    <section className="flex h-full min-h-0 flex-col gap-[clamp(0.6rem,1.2vw,1.4rem)]">
      <div className="flex gap-[clamp(0.5rem,1vw,1.2rem)]">
        <Counter value={counters.pages} ru="Страниц создано" sub="Pages · 页面" />
        <Counter value={counters.requests} ru="Заявок" sub="Requests · 询价" />
        <Counter value={counters.replies} ru="Ответов" sub="Replies · 回复" />
        <Counter value={counters.langs.length} ru="Языков связано" sub="Languages · 语言" />
      </div>

      <div className={`lv-fadeOut relative min-h-0 flex-1 overflow-hidden`}>
        {shown.length === 0 ? (
          loaded || !connected ? <Empty /> : null
        ) : (
          <div className="flex flex-col">
            {shown.map(({ view, fresh }, i) => (
              <div
                key={view.id}
                className={`lv-enter ${fresh ? "" : "lv-enterNow"}`}
                style={{ opacity: OPACITY[i] ?? 0.15, transition: "opacity 600ms ease" }}
              >
                <div className={"lv-inner"}>
                  <div className="pb-[clamp(0.6rem,1vw,1.2rem)]">
                    {view.kind === "request" ? (
                      <RequestCard ev={view} fresh={fresh && i === 0} />
                    ) : view.kind === "reply" ? (
                      <ReplyCard ev={view} fresh={fresh && i === 0} />
                    ) : (
                      <ListingCard ev={view} fresh={fresh} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="flex items-center justify-end gap-2 text-[clamp(0.65rem,0.9vw,1rem)] font-semibold text-white/50" aria-live="polite">
        <span className={`relative inline-block h-2 w-2 rounded-full ${connected ? `text-ok bg-ok lv-live` : "bg-busy"}`} />
        {connected ? "LIVE" : "Нет связи — переподключаемся…"}
      </p>
    </section>
  );
}
