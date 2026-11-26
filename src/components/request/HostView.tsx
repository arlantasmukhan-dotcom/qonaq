"use client";

import { useState } from "react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { useSpeech } from "@/components/useSpeech";
import { HOST } from "@/i18n/request";
import { formatKzt } from "@/lib/currency";
import { formatRange } from "@/lib/templates";
import type { Message } from "@/lib/types";
import { LiveDot } from "./LiveDot";
import { useRequestPolling, type RequestData } from "./usePolling";

type Action = "available" | "busy" | "car";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function HostView({
  code,
  initial,
  hostKey,
  lang,
}: {
  code: string;
  initial: RequestData;
  hostKey: string;
  lang: "ru" | "kk";
}) {
  const h = HOST[lang];
  const { data, live, addMessage } = useRequestPolling(code, hostKey, initial);
  const { request, listing, messages } = data;
  const car = listing.extras.find((e) => e.kind === "car") ?? null;
  const speech = useSpeech(lang === "kk" ? "kk-KZ" : "ru-RU");

  const [busy, setBusy] = useState<Action | "text" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const textValue = [draft, speech.text, speech.interim].filter(Boolean).join(" ");
  const lastHostMsg = [...messages].reverse().find((m) => m.author === "host") ?? null;
  const guestKind = h.guestKind[request.guestLang];
  const statusLabel =
    request.status === "available" ? h.statusAvailable : request.status === "busy" ? h.statusBusy : h.statusNew;
  const statusTone =
    request.status === "available"
      ? "bg-ok-soft text-ok"
      : request.status === "busy"
        ? "bg-busy-soft text-busy"
        : "bg-saffron-soft text-ink";

  async function reply(payload: { action: Action } | { text: string }) {
    if (busy) return;
    const key: Action | "text" = "action" in payload ? payload.action : "text";
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${code}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k: hostKey, lang, ...payload }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: { code?: string } };
        const c = b.error?.code;
        setError(c === "ai_no_key" ? h.errNoKey : c === "ai_failed" ? h.errAi : c === "forbidden" ? h.errForbidden : h.errNetwork);
        return;
      }
      const j = (await res.json()) as { message: Message; status: typeof request.status };
      addMessage(j.message, j.status);
      if ("text" in payload) {
        setDraft("");
        speech.stop();
        speech.reset();
      }
      setCopied(false);
    } catch {
      setError(h.errNetwork);
    } finally {
      setBusy(null);
    }
  }

  async function onCopy(text: string) {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const micMessage = speech.error ? h.micDenied : !speech.supported ? h.micUnsupported : null;

  return (
    <main className="page" lang={lang}>
      <div className="flex items-center justify-between gap-3 py-2">
        <span className="text-lg font-extrabold tracking-tight text-teal">Qonaq</span>
        <LangSwitcher current={lang} langs={["kk", "ru"]} />
      </div>

      <section className="card animate-rise p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-extrabold uppercase tracking-wide text-muted">{h.title}</h1>
          <LiveDot live={live} label={live ? h.live : h.offline} />
        </div>
        <p className="mt-2 text-2xl font-extrabold leading-tight">{request.guestName}</p>
        {guestKind && <p className="text-sm text-muted">{guestKind}</p>}
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
          <dt className="font-bold text-muted">{h.dates}</dt>
          <dd className="text-right font-extrabold">
            {formatRange(request.dateFrom, request.dateTo, lang)}
            <span className="block text-sm font-semibold text-muted">{h.nights(request.nights)}</span>
          </dd>
          <dt className="font-bold text-muted">{h.from}</dt>
          <dd className="text-right font-extrabold">{h.guests(request.guests)}</dd>
          <dt className="font-bold text-muted">{h.byPrice}</dt>
          <dd className="text-right font-extrabold text-teal">
            {request.totalKzt ? formatKzt(request.totalKzt) : h.noPrice}
          </dd>
        </dl>
        {request.wantsCar && (
          <p className="mt-3 rounded-xl bg-saffron-soft px-3 py-2 text-sm font-bold">🚗 {h.wantsCar}</p>
        )}
        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${statusTone}`} aria-live="polite">
          {statusLabel}
        </p>
      </section>

      <section className="mt-4" aria-label={h.thread} aria-live="polite">
        <h2 className="mb-2 text-sm font-extrabold text-muted">{h.question}</h2>
        {messages.length === 0 ? (
          <p className="card px-4 py-3 text-muted">{h.noQuestion}</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <HostBubble key={m.id} m={m} lang={lang} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-extrabold text-muted">{h.yourAnswer}</h2>
        <div className="grid gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void reply({ action: "available" })}
            className="btn btn-xl w-full !min-h-[4.5rem] !text-2xl !bg-ok text-white"
          >
            {busy === "available" ? h.sending : `✓ ${h.available}`}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void reply({ action: "busy" })}
            className="btn btn-xl w-full !min-h-[4.5rem] !text-2xl !bg-busy text-white"
          >
            {busy === "busy" ? h.sending : `✕ ${h.busy}`}
          </button>
          {car && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void reply({ action: "car" })}
              className="btn btn-accent btn-xl w-full !min-h-[4.5rem] !text-xl"
            >
              {busy === "car" ? h.sending : `🚗 ${h.car(car.priceKzt ? formatKzt(car.priceKzt) : null)}`}
            </button>
          )}
        </div>
      </section>

      <section className="card mt-5 space-y-3 p-4">
        <label htmlFor="host-text" className="label !mb-0 text-sm">
          {h.orWrite}
        </label>
        <textarea
          id="host-text"
          className="input min-h-24 resize-y"
          rows={3}
          maxLength={1000}
          value={textValue}
          placeholder={h.placeholder}
          onChange={(e) => {
            setDraft(e.target.value);
            speech.reset();
          }}
        />
        {micMessage && <p className="text-sm text-muted">{micMessage}</p>}
        <div className="flex gap-2">
          {speech.supported && !speech.error && (
            <button
              type="button"
              onClick={() => (speech.listening ? speech.stop() : speech.start())}
              aria-pressed={speech.listening}
              className={`btn flex-1 ${speech.listening ? "btn-accent animate-mic" : "btn-ghost"}`}
            >
              🎤 {speech.listening ? `${h.micStop} · ${h.micListening}` : h.mic}
            </button>
          )}
          <button
            type="button"
            disabled={busy !== null || !textValue.trim()}
            onClick={() => void reply({ text: textValue.trim() })}
            className="btn btn-primary flex-1"
          >
            {busy === "text" ? h.sending : h.sendText}
          </button>
        </div>
      </section>

      <div aria-live="assertive">
        {error && (
          <p role="alert" className="mt-3 rounded-2xl bg-busy-soft p-3 text-sm font-semibold text-busy">
            {error}
          </p>
        )}
      </div>

      {lastHostMsg && (
        <section className="card animate-rise mt-5 border-ok/40 bg-ok-soft p-4" aria-live="polite">
          <p className="text-sm font-extrabold text-ok">{h.guestWillSee(h.langPrep[request.guestLang])}</p>
          <p lang={request.guestLang} className="mt-2 whitespace-pre-line text-lg font-semibold leading-relaxed">
            {lastHostMsg.translations[request.guestLang]}
          </p>
          <button
            type="button"
            onClick={() => void onCopy(lastHostMsg.translations[request.guestLang])}
            className="btn btn-ghost mt-3 w-full bg-white"
          >
            {copied ? `✓ ${h.copied}` : `📋 ${h.copy}`}
          </button>
        </section>
      )}
    </main>
  );
}

function HostBubble({ m, lang }: { m: Message; lang: "ru" | "kk" }) {
  const h = HOST[lang];
  const mine = m.author === "host";
  const shown = mine ? m.original : m.translations[lang] || m.original;
  const showOriginal = !mine && m.original.trim() !== shown.trim();
  return (
    <li className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <span className="mb-1 px-1 text-xs font-bold text-muted">{mine ? h.youLabel : h.guestLabel}</span>
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 ${
          mine ? "rounded-br-md bg-teal text-white" : "rounded-bl-md border border-line bg-paper"
        }`}
      >
        <p className="whitespace-pre-line text-lg leading-relaxed">{shown}</p>
        {showOriginal && (
          <p lang={m.lang} className="mt-2 whitespace-pre-line text-xs text-muted">
            {h.originalLabel}: {m.original}
          </p>
        )}
      </div>
    </li>
  );
}
