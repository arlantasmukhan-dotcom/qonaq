"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HostDict } from "@/i18n/host";
import type { BookingRequest, Lang, Listing, Message } from "@/lib/types";
import { apiJson, copyText } from "./api";
import { Confetti } from "./Confetti";

type Req = BookingRequest & { hostKey: string; messages?: Message[] };

/**
 * The guest wrote again after the host's last answer (button, car or text). A request with no host
 * answer yet already shows "new", so only a message after an answer needs the badge.
 */
function awaitsHost(r: Req): boolean {
  const msgs = r.messages ?? [];
  return msgs.at(-1)?.author === "guest" && msgs.some((m) => m.author === "host");
}
const FLAG: Record<Lang, string> = { kk: "🇰🇿", ru: "🇷🇺", en: "🇬🇧", zh: "🇨🇳" };

function fmtDate(d: string, locale: string) {
  const dt = new Date(`${d}T12:00:00`);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function CopyButton({ text, label, done, className = "" }: { text: string; label: string; done: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (await copyText(text)) {
          setOk(true);
          setTimeout(() => setOk(false), 1800);
        }
      }}
    >
      <span aria-live="polite">{ok ? `✓ ${done}` : label}</span>
    </button>
  );
}

export function HostDashboard({
  t,
  hostLang,
  initial,
  origin,
  token,
}: {
  t: HostDict;
  hostLang: "kk" | "ru";
  initial: Listing;
  origin: string;
  token: string;
}) {
  const [listing, setListing] = useState(initial);
  const [requests, setRequests] = useState<Req[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const publicUrl = `${origin}/${listing.village}/${listing.slug}`;
  const magic = `${origin}/host/${listing.id}?t=${token}`;
  const published = listing.status === "published";
  const locale = hostLang === "kk" ? "kk-KZ" : "ru-RU";

  const load = useCallback(async () => {
    try {
      const r = await apiJson<{ listing: Listing; requests: Req[] }>(
        `/api/listings/${initial.id}?t=${encodeURIComponent(token)}`,
        { cache: "no-store" },
      );
      setListing(r.listing);
      setRequests(r.requests);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, [initial.id, token]);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 5000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    if (!published) return;
    const key = `qonaq_celebrated_${initial.id}`;
    if (sessionStorage.getItem(key)) return;
    const on = setTimeout(() => {
      sessionStorage.setItem(key, "1");
      setConfetti(true);
    }, 0);
    const off = setTimeout(() => setConfetti(false), 4200);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [published, initial.id]);

  const title = listing.content[hostLang].title || listing.content[listing.sourceLang].title || listing.hostName;
  const cover = listing.photoIds[0];
  const wa = `https://wa.me/?text=${encodeURIComponent(`${t.shareText} ${publicUrl}`)}`;
  const statusLabel = { new: t.statusNew, available: t.statusAvailable, busy: t.statusBusy } as const;
  const statusCls = {
    new: "bg-saffron-soft text-ink",
    available: "bg-ok-soft text-ok",
    busy: "bg-busy-soft text-busy",
  } as const;

  return (
    <>
      {confetti && <Confetti />}
      <div className="animate-rise text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-ok text-3xl text-white shadow-lg" aria-hidden>
          ✓
        </div>
        <h1 className="text-3xl font-extrabold leading-tight">{t.doneTitle}</h1>
        <p className="mt-1 text-muted">{t.doneSub}</p>
      </div>

      {!published && (
        <div className="mt-4 rounded-2xl bg-saffron-soft p-4">
          <p className="font-bold">{t.draftNote}</p>
          <Link href={`/new/${listing.id}`} className="btn btn-accent mt-2 w-full">
            {t.finishCheck}
          </Link>
        </div>
      )}

      <section className="card mt-5 overflow-hidden text-center">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photo/${cover}`} alt="" className="aspect-[16/8] w-full object-cover" />
        )}
        <div className="p-5">
          <p className="mb-3 font-extrabold leading-snug">{title}</p>
          <div className="mx-auto w-64 max-w-full rounded-2xl border border-line bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/qr?text=${encodeURIComponent(publicUrl)}`} alt="QR" width={256} height={256} className="h-auto w-full" />
          </div>
          <p className="label mt-4 !mb-1">{t.link}</p>
          <div className="flex items-center gap-2 rounded-2xl bg-sand p-2 pl-3">
            <code className="min-w-0 flex-1 truncate text-left text-sm font-bold">{publicUrl.replace(/^https?:\/\//, "")}</code>
            <CopyButton text={publicUrl} label={t.copy} done={t.copied} className="btn btn-primary min-h-11 shrink-0 px-4 text-sm" />
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-3">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-xl">
          {t.shareWa}
        </a>
        <a href={publicUrl} className="btn btn-primary">
          {t.openPage}
        </a>
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/poster/${listing.id}`} className="btn btn-ghost">
            {t.poster}
          </Link>
          <Link href={`/new/${listing.id}`} className="btn btn-ghost">
            {t.editCard}
          </Link>
        </div>
      </div>

      <section className="mt-8" aria-label={t.requests}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{t.requests}</h2>
          <span className={`chip ${offline ? "!bg-busy-soft !text-busy" : ""}`}>
            <span className={`h-2 w-2 rounded-full ${offline ? "bg-busy" : "animate-pulse bg-ok"}`} />
            {offline ? t.offline : t.live}
          </span>
        </div>
        {requests === null ? (
          <div className="card h-24 animate-pulse" aria-hidden />
        ) : requests.length === 0 ? (
          <p className="card p-4 text-muted">{t.requestsEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="animate-rise">
                <Link
                  href={`/r/${r.code}?k=${r.hostKey}`}
                  className="card flex min-h-16 items-center gap-3 p-4 transition-transform active:scale-[0.98]"
                >
                  <span className="text-2xl" aria-hidden>
                    {FLAG[r.guestLang]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{r.guestName}</span>
                    <span className="block text-sm text-muted">
                      {fmtDate(r.dateFrom, locale)} – {fmtDate(r.dateTo, locale)} · {r.nights} {t.nights} · {r.guests} {t.guestsCount}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`chip ${statusCls[r.status]}`}>{statusLabel[r.status]}</span>
                    {awaitsHost(r) && <span className="chip bg-saffron text-ink">✉️ {t.newMessage}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border-2 border-dashed border-saffron bg-saffron-soft p-4">
        <h2 className="font-extrabold">🔑 {t.magicTitle}</h2>
        <p className="mt-1 text-sm text-ink/80">{t.magicText}</p>
        <p className="mt-2 break-all rounded-xl bg-white p-2 text-xs text-muted">{magic}</p>
        <CopyButton text={magic} label={t.magicCopy} done={t.copied} className="btn btn-accent mt-3 w-full" />
      </section>
    </>
  );
}
