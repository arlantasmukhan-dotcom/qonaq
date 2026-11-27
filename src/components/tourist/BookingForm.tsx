"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TOURIST } from "@/i18n/tourist";
import { DEFAULT_CURRENCY, formatIn, formatKzt } from "@/lib/currency";
import { nightsBetween } from "@/lib/templates";
import type { Lang, Listing } from "@/lib/types";
import { maxGuests, roomsFor } from "./price";

const MY_REQUESTS_KEY = "qonaq_my_requests";

type ApiError = { error?: { code?: string; message?: string } };
type Created = { code: string; requestUrl: string; waUrl: string };

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function saveLocal(code: string, listingTitle: string, waUrl: string) {
  try {
    const raw = localStorage.getItem(MY_REQUESTS_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(list) ? list : [];
    arr.unshift({ code, listingTitle, createdAt: Date.now() });
    localStorage.setItem(MY_REQUESTS_KEY, JSON.stringify(arr.slice(0, 30)));
    localStorage.setItem(`qonaq_wa_${code}`, waUrl);
  } catch {
    /* private mode: the request page still works from the URL */
  }
}

export function BookingForm({
  listing,
  lang,
  today,
  defaultFrom,
  defaultTo,
}: {
  listing: Listing;
  lang: Lang;
  today: string;
  defaultFrom: string;
  defaultTo: string;
}) {
  const t = TOURIST[lang];
  const router = useRouter();
  const car = listing.extras.find((e) => e.kind === "car") ?? null;

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  // Never offer more guests than the house holds (rooms × guests per room), or the quote would bill rooms it lacks.
  const maxG = maxGuests(listing.rooms, listing.priceGuests);
  const [guests, setGuests] = useState(Math.min(2, maxG));
  const [name, setName] = useState("");
  const [wantsCar, setWantsCar] = useState(false);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState<null | "wa" | "plain">(null);
  const [error, setError] = useState<{ code: string; text: string; mode: "wa" | "plain" } | null>(null);

  const nights = useMemo(() => nightsBetween(from, to), [from, to]);
  const rooms = roomsFor(guests, listing.priceGuests);
  const total = listing.priceKzt && nights >= 1 ? listing.priceKzt * nights * rooms : null;
  const cur = DEFAULT_CURRENCY[lang];

  function onFrom(v: string) {
    setFrom(v);
    if (v && nightsBetween(v, to) < 1) setTo(addDays(v, 1));
  }

  async function submit(mode: "wa" | "plain", skipQuestion = false) {
    if (busy) return;
    setError(null);
    if (!name.trim()) {
      setError({ code: "name", text: t.errName, mode });
      document.getElementById("guest-name")?.focus();
      return;
    }
    if (!from || !to || nights < 1) {
      setError({ code: "dates", text: t.errDates, mode });
      return;
    }
    setBusy(mode);
    // Open the WhatsApp window now, inside the tap, so mobile browsers do not block it after the fetch.
    const popup = mode === "wa" ? window.open("", "_blank") : null;
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          guestName: name.trim(),
          guestLang: lang,
          guests,
          dateFrom: from,
          dateTo: to,
          wantsCar: car ? wantsCar : false,
          question: skipQuestion ? "" : question.trim(),
        }),
      });
      if (!res.ok) {
        popup?.close();
        const body = (await res.json().catch(() => ({}))) as ApiError;
        const code = body.error?.code ?? "unknown";
        const text =
          res.status === 429 || code === "rate_limited"
            ? t.errRate
            : code === "ai_no_key"
              ? t.errNoKey
              : code === "ai_failed"
                ? t.errAi
                : code === "too_many_guests"
                  ? t.errGuests
                  : code === "bad_request"
                  ? t.errDates
                  : t.errNetwork;
        setError({ code, text, mode });
        setBusy(null);
        return;
      }
      const data = (await res.json()) as Created;
      saveLocal(data.code, listing.content[lang].title, data.waUrl);
      if (popup) {
        try {
          popup.location.href = data.waUrl;
        } catch {
          popup.close();
        }
      }
      router.push(`/r/${data.code}`);
    } catch {
      popup?.close();
      setError({ code: "network", text: t.errNetwork, mode });
      setBusy(null);
    }
  }

  const priceLine =
    total !== null && listing.priceKzt ? (
      <p className="text-sm font-semibold leading-relaxed text-ink">
        {t.nights(nights)}
        {rooms > 1 ? ` × ${t.roomsMult(rooms)}` : ""} × {formatKzt(listing.priceKzt)} ={" "}
        <span className="text-base font-extrabold text-patina">{formatKzt(total)}</span>
        {cur !== "KZT" && <span className="text-muted"> ({formatIn(total, cur)})</span>}
      </p>
    ) : null;

  const aiProblem = error?.code === "ai_no_key" || error?.code === "ai_failed";

  return (
    <form
      id="book"
      className="card space-y-4 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit("wa");
      }}
    >
      <h2 className="text-xl font-extrabold">{t.bookTitle}</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="date-from">
            {t.dateFrom}
          </label>
          <input
            id="date-from"
            type="date"
            className="input"
            value={from}
            min={today}
            required
            onChange={(e) => onFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="date-to">
            {t.dateTo}
          </label>
          <input
            id="date-to"
            type="date"
            className="input"
            value={to}
            min={from ? addDays(from, 1) : today}
            required
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <div>
        <span className="label" id="guests-label">
          {t.guestsLabel}
        </span>
        <div className="flex items-center justify-between rounded-2xl border-[1.5px] border-line bg-white p-1" role="group" aria-labelledby="guests-label">
          <button
            type="button"
            aria-label={t.fewer}
            disabled={guests <= 1}
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="btn btn-ghost h-12 w-12 !min-h-12 !p-0 text-2xl"
          >
            −
          </button>
          <output aria-live="polite" className="text-lg font-extrabold">
            {t.guestsCount(guests)}
          </output>
          <button
            type="button"
            aria-label={t.more}
            disabled={guests >= maxG}
            onClick={() => setGuests((g) => Math.min(maxG, g + 1))}
            className="btn btn-ghost h-12 w-12 !min-h-12 !p-0 text-2xl"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="guest-name">
          {t.nameLabel}
        </label>
        <input
          id="guest-name"
          className="input"
          value={name}
          maxLength={60}
          autoComplete="name"
          placeholder={t.namePlaceholder}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {car && (
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] border-line bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={wantsCar}
            onChange={(e) => setWantsCar(e.target.checked)}
            className="h-6 w-6 shrink-0 accent-[var(--color-patina)]"
          />
          <span className="text-sm font-semibold">
            🚗 {t.carToggle(car.priceKzt ? formatKzt(car.priceKzt) : null)}
          </span>
        </label>
      )}

      <div>
        <label className="label" htmlFor="guest-question">
          {t.questionLabel}
        </label>
        <textarea
          id="guest-question"
          className="input min-h-28 resize-y"
          rows={4}
          maxLength={1000}
          value={question}
          placeholder={t.questionPlaceholder}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      {priceLine && (
        <div className="rounded-2xl bg-patina-soft p-3" aria-live="polite">
          {priceLine}
          <p className="mt-0.5 text-xs text-muted">{t.totalNote}</p>
        </div>
      )}

      <div aria-live="assertive">
        {error && (
          <div role="alert" className="rounded-2xl bg-busy-soft p-3 text-sm font-semibold text-busy">
            {error.text}
            {aiProblem && (
              <button
                type="button"
                onClick={() => void submit(error.mode, true)}
                className="btn btn-ghost mt-2 w-full bg-white !text-ink"
              >
                {t.retryWithoutQuestion}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button type="submit" disabled={busy !== null} className="btn btn-whatsapp btn-xl w-full">
          {busy === "wa" ? t.sending : t.writeToHost}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => void submit("plain")} className="btn btn-ghost w-full">
          {busy === "plain" ? t.sending : t.sendWithoutWa}
        </button>
        <p className="text-center text-xs text-muted">{t.waHint}</p>
      </div>
    </form>
  );
}
