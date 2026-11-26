"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { TOURIST } from "@/i18n/tourist";
import { hostNameIn } from "@/lib/names";
import { DEFAULT_CURRENCY, formatIn, formatKzt } from "@/lib/currency";
import { LANG_NAME_IN } from "@/lib/lang";
import { formatRange } from "@/lib/templates";
import type { Lang, Message } from "@/lib/types";
import { LiveDot } from "./LiveDot";
import { useRequestPolling, type RequestData } from "./usePolling";

const noopSubscribe = () => () => {};

function useStoredWaUrl(code: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return localStorage.getItem(`qonaq_wa_${code}`);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

export function GuestView({ code, initial, lang }: { code: string; initial: RequestData; lang: Lang }) {
  const t = TOURIST[lang];
  const { data, live, addMessage } = useRequestPolling(code, null, initial);
  const { request, listing, messages } = data;
  const host = hostNameIn(listing, lang);
  const waUrl = useStoredWaUrl(code);
  const cur = DEFAULT_CURRENCY[lang];

  const status = request.status;
  const tone =
    status === "available"
      ? "bg-ok text-white"
      : status === "busy"
        ? "bg-busy text-white"
        : "bg-saffron-soft text-ink border border-saffron/40";

  return (
    <main className="page">
      <div className="flex items-center justify-between gap-3 py-2">
        <Link href="/" className="inline-flex min-h-12 items-center text-lg font-extrabold tracking-tight text-teal">
          Qonaq
        </Link>
        <LangSwitcher current={lang} via="query" />
      </div>

      <section
        aria-live="polite"
        className={`animate-rise rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)] ${tone}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wide opacity-80">{t.reqTitle}</span>
          <span className={status === "new" ? "" : "rounded-full bg-white/90 px-2 py-0.5"}>
            <LiveDot live={live} label={t.live} />
          </span>
        </div>
        {status === "new" ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <span aria-hidden className="relative flex h-4 w-4 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-70" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-saffron" />
              </span>
              <h1 className="text-xl font-extrabold leading-snug">{t.waiting(host)}</h1>
            </div>
            <p className="mt-2 text-sm text-muted">{t.waitingSub}</p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-extrabold leading-snug">
              <span aria-hidden>{status === "available" ? "✓ " : "✕ "}</span>
              {status === "available" ? t.availableTitle(host) : t.busyTitle(host)}
            </h1>
            <p className="mt-2 text-sm opacity-90">{status === "available" ? t.availableSub : t.busySub}</p>
          </>
        )}
      </section>

      {status === "new" && waUrl && (
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-xl mt-4 w-full flex-col !gap-0">
          <span>{t.openWa}</span>
          <span className="text-xs font-semibold opacity-80">{t.openWaSub}</span>
        </a>
      )}

      <section className="card mt-4 p-4" aria-label={t.summary}>
        <Link href={`/${listing.village}/${listing.slug}`} className="block font-extrabold leading-snug text-teal">
          {listing.content[lang].title}
        </Link>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-bold text-muted">{t.dates}</dt>
          <dd className="text-right font-semibold">
            {formatRange(request.dateFrom, request.dateTo, lang)} · {t.nights(request.nights)}
          </dd>
          <dt className="font-bold text-muted">{t.guestsLabel}</dt>
          <dd className="text-right font-semibold">{t.guestsCount(request.guests)}</dd>
          {request.totalKzt ? (
            <>
              <dt className="font-bold text-muted">{t.total}</dt>
              <dd className="text-right font-extrabold">
                {formatKzt(request.totalKzt)}
                {cur !== "KZT" && <span className="block text-xs font-semibold text-muted">{formatIn(request.totalKzt, cur)}</span>}
              </dd>
            </>
          ) : null}
        </dl>
      </section>

      <Thread
        messages={messages}
        lang={lang}
        host={host}
        title={t.thread}
        show={messages.length > 0}
      />

      <FollowUp code={code} lang={lang} onSent={addMessage} />
    </main>
  );
}

function Thread({
  messages,
  lang,
  host,
  title,
  show,
}: {
  messages: Message[];
  lang: Lang;
  host: string;
  title: string;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <section className="mt-5" aria-label={title} aria-live="polite">
      <h2 className="mb-2 text-sm font-extrabold text-muted">{title}</h2>
      <ul className="space-y-3">
        {messages.map((m) => (
          <Bubble key={m.id} m={m} lang={lang} host={host} />
        ))}
      </ul>
    </section>
  );
}

function Bubble({ m, lang, host }: { m: Message; lang: Lang; host: string }) {
  const t = TOURIST[lang];
  const [open, setOpen] = useState(false);
  const mine = m.author === "guest";
  const shown = mine ? m.original : m.translations[lang] || m.original;
  const hasOriginal = !mine && m.original.trim() !== shown.trim();
  const icon = m.action === "available" ? "✓ " : m.action === "busy" ? "✕ " : m.action === "car" ? "🚗 " : "";

  return (
    <li className={`animate-rise flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <span className="mb-1 px-1 text-xs font-bold text-muted">{mine ? t.youLabel : t.hostLabel(host)}</span>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed ${
          mine ? "rounded-br-md bg-teal text-white" : "rounded-bl-md border border-line bg-paper"
        }`}
      >
        <p className="whitespace-pre-line">
          {icon}
          {shown}
        </p>
        {hasOriginal && (
          <>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-2 inline-flex min-h-8 items-center text-xs font-bold text-teal underline-offset-2"
            >
              {open ? t.hideOriginal : `${t.original} · ${LANG_NAME_IN[lang][m.lang]}`}
            </button>
            {open && (
              <p lang={m.lang} className="mt-1 border-t border-line pt-2 text-sm text-muted whitespace-pre-line">
                {m.original}
              </p>
            )}
          </>
        )}
      </div>
    </li>
  );
}

function FollowUp({ code, lang, onSent }: { code: string; lang: Lang; onSent: (m: Message) => void }) {
  const t = TOURIST[lang];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (!v || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/requests/${code}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: v }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: { code?: string } };
        setErr(b.error?.code === "ai_no_key" ? t.errNoKey : b.error?.code === "ai_failed" ? t.errAi : t.msgError);
        return;
      }
      const j = (await res.json()) as { message: Message };
      onSent(j.message);
      setText("");
    } catch {
      setErr(t.errNetwork);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} className="card mt-5 space-y-3 p-4">
      <label className="label !mb-0 text-sm" htmlFor="followup">
        {t.followUp}
      </label>
      <textarea
        id="followup"
        className="input min-h-24 resize-y"
        rows={3}
        maxLength={1000}
        value={text}
        placeholder={t.followUpPlaceholder}
        onChange={(e) => setText(e.target.value)}
      />
      {err && (
        <p role="alert" className="text-sm font-semibold text-busy">
          {err}
        </p>
      )}
      <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary w-full">
        {busy ? t.sendingMsg : t.send}
      </button>
    </form>
  );
}
